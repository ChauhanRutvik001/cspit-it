import express from "express";
import {
  createPlacementRound,
  getPlacementDriveRounds,
  updatePlacementRound,
  deletePlacementRound,
  startPlacementRound,
  completePlacementRound,
  getRoundDetails,
  cleanupOrphanedRounds,
  getStudentProgressForCompany
} from "../controllers/placementRound.controller.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Create placement round
router.post("/create", isAuthorized, isAdmin, createPlacementRound);

// Get all rounds for a placement drive
router.get("/drive/:driveId", isAuthorized, isAdmin, getPlacementDriveRounds);

// Get round details with student progress
router.get("/:roundId", isAuthorized, isAdmin, getRoundDetails);

// Update placement round
router.put("/:roundId", isAuthorized, isAdmin, updatePlacementRound);

// Delete placement round
router.delete("/:roundId", isAuthorized, isAdmin, deletePlacementRound);

// Start a placement round
router.patch("/:roundId/start", isAuthorized, isAdmin, startPlacementRound);

// Complete a placement round and shortlist students
router.patch("/:roundId/complete", isAuthorized, isAdmin, completePlacementRound);

// Clean up orphaned rounds (utility route)
router.post("/cleanup", isAuthorized, isAdmin, cleanupOrphanedRounds);

// Get student progress for a specific company
router.get("/student/:studentId/company/:companyId", isAuthorized, getStudentProgressForCompany);

export default router;