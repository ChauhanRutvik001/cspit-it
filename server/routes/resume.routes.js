import express from "express";
import { uploadResume, getAllResumes, getResume, deleteResume, getResumebyUserID,getResumebyUserIDAdmin } from "../controllers/resume.controller.js";
import upload from "../middlewares/resume.js";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/upload", isAuthorized, upload.single("resume"), uploadResume); //ResumeViewer.jsx
// router.get("/all",isAuthorized, isAdmin, getAllResumes); not use
// router.get("/:filename", isAuthorized, getResume); not use
router.delete("/:id", isAuthorized, deleteResume); //ResumeViewer.jsx
router.get("/getResumebyUserID/:id", isAuthorized, getResumebyUserID); //ResumeViewer.jsx
router.get("/getUserResume/:id", isAuthorized,isAdmin, getResumebyUserIDAdmin); //StudentResume.jsx


export default router;
