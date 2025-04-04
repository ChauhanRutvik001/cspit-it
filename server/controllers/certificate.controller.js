import mongoose from "mongoose";
import Certificate from "../models/certificateSchema.js";
import PendingRequest from "../models/pendingRequestSchema.js";
import { GridFSBucket } from "mongodb";
import User from "../models/user.js";

// Delete declined certificates after 20 seconds
const DECLINE_EXPIRATION_SECONDS = 1;

export const uploadCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    console.log("Certificate upload API hit by user:", userId);

    if (!userId || !file) {
      return res
        .status(400)
        .json({ error: "User ID and image file are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has a counsellor assigned
    if (!user.profile || !user.profile.counsellor) {
      return res.status(403).json({
        error:
          "You must have a counsellor assigned before uploading certificates",
        status: "COUNSELLOR_REQUIRED",
      });
    }

    // Check if file type is an image
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ error: "Only image files (JPEG, PNG, GIF, WEBP) are allowed" });
    }

    const newCertificate = new Certificate({
      filename: file.filename,
      fileId: new mongoose.Types.ObjectId(file.id),
      fileType: file.mimetype,
      uploadedBy: new mongoose.Types.ObjectId(userId),
      description: req.body.description || "",
    });

    await newCertificate.save();

    // Create a pending request
    const pendingRequest = new PendingRequest({
      certificateId: newCertificate._id,
      studentId: userId,
      counsellorId: user.profile.counsellor,
    });

    await pendingRequest.save();

    res.status(201).json({
      message:
        "Certificate uploaded successfully and pending counsellor's approval",
      certificate: newCertificate,
    });
  } catch (error) {
    console.error("Certificate upload error:", error);
    res
      .status(500)
      .json({ error: "Failed to upload certificate. Please try again." });
  }
};

export const updateCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const file = req.file;

    if (!mongoose.Types.ObjectId.isValid(certificateId) || !file) {
      return res
        .status(400)
        .json({ error: "Invalid certificate ID or missing file" });
    }

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Check if file type is an image
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ error: "Only image files (JPEG, PNG, GIF, WEBP) are allowed" });
    }

    // Delete the old file from the storage
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "certificates",
    });
    await bucket.delete(new mongoose.Types.ObjectId(certificate.fileId));

    // Update certificate details
    certificate.filename = file.filename;
    certificate.fileId = new mongoose.Types.ObjectId(file.id);
    certificate.fileType = file.mimetype;
    certificate.description = req.body.description || certificate.description;

    await certificate.save();

    res.status(200).json({
      message: "Certificate updated successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating certificate" });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(certificateId)) {
      return res.status(400).json({ error: "Invalid certificate ID" });
    }

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const userId = certificate.uploadedBy;

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "certificates",
    });
    await bucket.delete(new mongoose.Types.ObjectId(certificate.fileId));
    await Certificate.findByIdAndDelete(certificateId);
    await PendingRequest.findOneAndDelete({ certificateId });

    await User.findByIdAndUpdate(
      userId,
      { $pull: { certificates: certificateId } },
      { new: true }
    );

    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting certificate" });
  }
};

export const approveCertificate = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const request = await PendingRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "approved";
    await request.save();

    // Move the certificate to the student's profile
    await User.findByIdAndUpdate(
      request.studentId,
      { $push: { certificates: request.certificateId } },
      { new: true }
    );

    res.status(200).json({ message: "Certificate approved" });
  } catch (error) {
    res.status(500).json({ error: "Error approving certificate" });
  }
};

export const declineCertificate = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const request = await PendingRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "declined";
    await request.save();

    // Schedule deletion of the certificate after specified seconds
    setTimeout(async () => {
      try {
        const certificate = await Certificate.findById(request.certificateId);
        if (certificate) {
          const userId = certificate.uploadedBy;

          const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: "certificates",
          });
          await bucket.delete(new mongoose.Types.ObjectId(certificate.fileId));
          await Certificate.findByIdAndDelete(request.certificateId);
          
          await User.findByIdAndUpdate(
            userId,
            { $pull: { certificates: request.certificateId } },
            { new: true }
          );
          
          // Delete the pending request after certificate deletion
          await PendingRequest.findByIdAndDelete(requestId);
        }
      } catch (err) {
        console.error("Error during scheduled deletion:", err);
      }
    }, DECLINE_EXPIRATION_SECONDS * 1000);

    res.status(200).json({
      message: `Certificate declined and will be deleted after ${DECLINE_EXPIRATION_SECONDS} seconds`,
    });
  } catch (error) {
    res.status(500).json({ error: "Error declining certificate" });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const pendingRequests = await PendingRequest.find({
      studentId: userId,
    }).populate("certificateId");
    console.log("Pending Requests:", pendingRequests);

    const certificates = await Certificate.find({ uploadedBy: userId });

    res.status(200).json(
      certificates.map((cert) => ({
        ...cert.toObject(),
        status:
          pendingRequests.find((req) => req.certificateId.equals(cert._id))
            ?.status || "approved",
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve certificates" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const counsellorId = req.user.id;
    console.log("Counsellor ID:", counsellorId);
    console.log("Search Term:", search);
    
    // Base query for pending requests
    let pendingRequestsQuery = {
      counsellorId,
      status: "pending"
    };
    
    // Find student IDs matching the search criteria if search term is provided
    let matchingStudentIds = [];
    let matchingCertificateIds = [];
    
    if (search && search.trim() !== "") {
      // Find students matching the search term
      const searchRegex = new RegExp(search, 'i');
      
      // Find students by ID or name
      const matchingStudents = await User.find({
        $or: [
          { id: searchRegex },
          { name: searchRegex }
        ]
      }).select('_id');
      
      matchingStudentIds = matchingStudents.map(student => student._id);
      
      // Find certificates matching the search term (by filename)
      const matchingCertificates = await Certificate.find({
        filename: searchRegex
      }).select('_id');
      
      matchingCertificateIds = matchingCertificates.map(cert => cert._id);
      
      // If we have matching students or certificates, update the query
      if (matchingStudentIds.length > 0 || matchingCertificateIds.length > 0) {
        pendingRequestsQuery = {
          counsellorId,
          status: "pending",
          $or: [
            { studentId: { $in: matchingStudentIds } },
            { certificateId: { $in: matchingCertificateIds } }
          ]
        };
      } else if (search.trim() !== "") {
        // If no matches found but search term was provided, return empty results
        return res.json({ students: [], total: 0 });
      }
    }
    
    // Get total count for pagination
    const total = await PendingRequest.countDocuments(pendingRequestsQuery);
    
    // Get the actual pending requests with pagination
    const pendingRequests = await PendingRequest.find(pendingRequestsQuery)
      .populate("studentId certificateId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sort by newest first

    // Map the pending requests to student data with certificates
    const students = await Promise.all(
      pendingRequests.map(async (request) => {
        const student = await User.findById(request.studentId);
        const certificates = await Certificate.find({
          _id: request.certificateId,
        });

        return {
          _id: student._id,
          name: student.name,
          id: student.id,
          certificates,
          pendingRequests: [request],
        };
      })
    );

    res.json({ students, total });
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({ 
      error: "Failed to fetch students with pending requests",
      details: error.message 
    });
  }
};

export const getCertificateFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "certificates",
    });

    const stream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );
    stream.on("error", () => res.status(404).json({ error: "File not found" }));

    res.set("Content-Type", "application/octet-stream");
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving file" });
  }
};
