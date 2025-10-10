import express from "express";
import {
  createPlacementDrive,
  getCompanyPlacementDrives,
  getPlacementDriveDetails,
  updatePlacementDrive,
  deletePlacementDrive,
  getAllPlacementDrives,
  getStudentsInRound,
  uploadShortlistedStudents,
  rejectStudents,
  testEndpoint,
  getStudentPlacementDrives,
  getStudentProgress,
  getAllStudentProgress,
  getStudentPlacementDriveDetails
} from "../controllers/placementDrive.controller.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Test endpoint
router.get("/test", testEndpoint);

// Create placement drive (company/admin only)
router.post("/create", isAuthorized, isAdmin, createPlacementDrive);

// Get placement drives for a specific company
router.get("/company/:companyId", isAuthorized, isAdmin, getCompanyPlacementDrives);

// Get students in a specific round
router.get("/:driveId/round/:roundNumber/students", isAuthorized, isAdmin, getStudentsInRound);

// Upload shortlisted students for a round
router.post("/:driveId/round/:roundNumber/shortlist", isAuthorized, isAdmin, uploadShortlistedStudents);

// Reject students for a round
router.post("/:driveId/round/:roundNumber/reject", isAuthorized, isAdmin, rejectStudents);

// Get placement drive details with rounds and student progress
router.get("/:driveId", isAuthorized, isAdmin, getPlacementDriveDetails);

// Update placement drive
router.put("/:driveId", isAuthorized, isAdmin, updatePlacementDrive);

// Delete placement drive
router.delete("/:driveId", isAuthorized, isAdmin, deletePlacementDrive);

// Get all placement drives (admin only)
router.get("/", isAuthorized, isAdmin, getAllPlacementDrives);

// Student routes - accessible to authenticated students
// Get all placement drives visible to students (public view)
router.get("/student/list", isAuthorized, getStudentPlacementDrives);

// Get student's progress in all placement drives
router.get("/student/progress", isAuthorized, getAllStudentProgress);

// Get student's progress in a specific placement drive
router.get("/student/progress/:driveId", isAuthorized, getStudentProgress);

// Get placement drive details for students (limited information)
router.get("/student/:driveId", isAuthorized, getStudentPlacementDriveDetails);

export default router;
