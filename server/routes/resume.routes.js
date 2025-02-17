import express from "express";
import { uploadResume, getAllResumes, getResume, deleteResume, getResumebyUserID } from "../controllers/resume.controller.js";
import upload from "../middlewares/resume.js";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/upload", isAuthorized, upload.single("resume"), uploadResume);
router.get("/all",isAuthorized, isAdmin, getAllResumes);
router.get("/:filename", isAuthorized, getResume);
router.delete("/:id", isAuthorized, deleteResume);
router.get("/getResumebyUserID/:id", isAuthorized, getResumebyUserID);


export default router;
