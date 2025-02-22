import express from "express";
import multer from "multer";
import path from "path";
import { createSchedule, getSchedules, deleteSchedule } from "../controllers/schedule.controller.js";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

// Configure Multer for image uploads only
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, and PNG image files are allowed."));
    }
  },
});

router.post("/", isAuthorized, isAdmin, upload.array("files"), createSchedule); // Schdeule.jsx
router.get("/", isAuthorized, getSchedules); // Schedule.jsx
router.delete("/:id", isAuthorized, isAdmin, deleteSchedule); // Schedule.jsx


export default router;