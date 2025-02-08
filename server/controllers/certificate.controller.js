import mongoose from "mongoose";
import Certificate from "../models/certificateSchema.js";
import { GridFSBucket } from "mongodb";
import User from "../models/user.js";

export const uploadCertificate = async (req, res) => {
  try {
    console.log("Certificate upload API hit");
    const userId = req.user.id;
    const file = req.file;

    if (!userId || !file) {
      return res
        .status(400)
        .json({ error: "User ID and image file are required" });
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


    await User.findByIdAndUpdate(
      userId,
      { $push: { certificates: newCertificate._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Image uploaded successfully",
      certificate: newCertificate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("user-->" + userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const certificates = await Certificate.find({ uploadedBy: userId });

    if (!certificates.length) {
      return res.status(404).json({ error: "No certificates found" });
    }

    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve certificates" });
  }
};

export const getUserCertificate = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("user-->" + userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const certificates = await Certificate.find({ uploadedBy: userId });

    if (!certificates.length) {
      return res.status(404).json({ error: "No certificates found" });
    }

    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve certificates" });
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

export const deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    console.log("Certificate ID:", certificateId);

    if (!mongoose.Types.ObjectId.isValid(certificateId)) {
      return res.status(400).json({ error: "Invalid certificate ID" });
    }

    const certificate = await Certificate.findById(certificateId);
    console.log(certificate);
    const userId = certificate.uploadedBy;
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "certificates",
    });

    await bucket.delete(new mongoose.Types.ObjectId(certificate.fileId));
    await Certificate.findByIdAndDelete(certificateId);

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
