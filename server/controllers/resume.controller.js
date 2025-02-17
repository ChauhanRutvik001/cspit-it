import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import { GridFSBucket } from "mongodb";

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = new GridFSBucket(conn.db, { bucketName: "resumes" });
});

// Function to ensure gfs is initialized
const getGFS = () => {
  if (!gfs) {
    gfs = new GridFSBucket(conn.db, { bucketName: "resumes" });
  }
  return gfs;
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if the user already has a resume uploaded
    const existingResume = await Resume.findOne({ userId: req.user.id });

    if (existingResume) {
      return res.status(400).json({
        error:
          "You have already uploaded a resume. Please delete the existing one before uploading a new one.",
      });
    }

    // Save the new resume
    const newResume = new Resume({
      filename: req.file.filename,
      contentType: req.file.mimetype,
      userId: req.user.id,
    });

    await newResume.save();
    res
      .status(201)
      .json({ message: "Resume uploaded successfully", newResume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all resumes (Admin only)
export const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().populate("userId", "name email");
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download a resume by filename
export const getResume = async (req, res) => {
  try {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params; // This is the userId, not the resume _id
    console.log(id);

    // Find the resume by userId
    const resume = await Resume.findOne({ userId: id });
    console.log(resume);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Ensure the user is authorized to delete their own resume
    if (
      resume.userId.toString() !== req.user.id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this resume" });
    }

    console.log("Deleting from GridFS...");

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "resumes",
    });

    await bucket.delete(new mongoose.Types.ObjectId(resume.fileId));

    // Remove the resume entry from the database
    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getResumebyUserID = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({
      userId: new mongoose.Types.ObjectId(id),
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const gfs = getGFS();
    const readStream = gfs.openDownloadStreamByName(resume.filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${resume.filename}"`
    );
    readStream.pipe(res);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: error.message });
  }
};
