import express from "express";
import multer from "multer";
import {
  createSchedule,
  getSchedules,
  deleteSchedule,
} from "../controllers/schedule.controller.js";
import path from "path";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|xlsx|xls|jpg|png|jpeg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Routes
router.post("/", isAuthorized, isAdmin, upload.array("files"), createSchedule);
router.get("/", isAuthorized, getSchedules);
router.delete("/:id", isAuthorized, isAdmin, deleteSchedule);

export default router;
