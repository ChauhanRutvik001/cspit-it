import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    // Allowed image MIME types
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return `${Date.now()}-invalid.${file.originalname.split(".").pop()}`;
    }

    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "certificates",
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed!"), false);
  }
};

export const upload = multer({ storage, fileFilter });