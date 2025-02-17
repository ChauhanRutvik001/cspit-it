import crypto from "crypto";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now(); // Get current timestamp
      const safeFilename = file.originalname.replace(/\s+/g, "_"); // Replace spaces with underscores

      const fileInfo = {
        filename: `${timestamp}_${safeFilename}`, // Use timestamp + original filename
        bucketName: "resumes", // Bucket name for GridFS
      };

      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

export default upload;
