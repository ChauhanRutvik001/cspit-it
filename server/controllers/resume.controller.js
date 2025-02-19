import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import { GridFSBucket } from "mongodb";
import User from "../models/user.js";

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

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { resume: newResume._id } },
      { new: true }
    );

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
    const { id } = req.params; // User ID from request params

    // Find the resume document by user ID
    const resume = await Resume.findOne({ userId: id });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Ensure user is authorized to delete their own resume
    if (
      resume.userId.toString() !== req.user.id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this resume" });
    }

    // Delete file from GridFS
    const gfs = getGFS();
    const file = await gfs.find({ filename: resume.filename }).toArray();

    if (!file || file.length === 0) {
      return res.status(404).json({ error: "File not found in GridFS" });
    }

    await gfs.delete(new mongoose.Types.ObjectId(file[0]._id));

    // Delete resume document from MongoDB
    await Resume.deleteOne({ userId: id });

    await User.findByIdAndUpdate(
      id,
      { $pull: { resume: resume._id } }, // Fix: Use `resume._id`
      { new: true }
    );

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getResumebyUserID = async (req, res) => {
  try {
    // const { id } = req.params;
    const id = req.user.id;
    console.log("id --->" + id);

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

export const getResumebyUserIDAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id --->" + id);

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

