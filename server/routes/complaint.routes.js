import express from "express";
import {
  submitComplaint,
  getComplaintStatus,
  getAllComplaints,
  updateComplaint,
  getPublicComplaints,
  getComplaintStats,
  deleteComplaint
} from "../controllers/complaint.controller.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public routes (accessible to all authenticated users)
router.get("/public", getPublicComplaints); // Get public complaints board

// Student routes (require authentication)
router.post("/submit", isAuthorized, submitComplaint); // Submit new complaint
router.get("/status/:complaintId", getComplaintStatus); // Check complaint status by ID (no auth needed for anonymity)

// Admin routes (require admin role)
router.get("/admin/all", isAuthorized, isAdmin, getAllComplaints); // Get all complaints for admin
router.put("/admin/:complaintId", isAuthorized, isAdmin, updateComplaint); // Update complaint
router.get("/admin/stats", isAuthorized, isAdmin, getComplaintStats); // Get complaint statistics
router.delete("/admin/:complaintId", isAuthorized, isAdmin, deleteComplaint); // Delete complaint

export default router;