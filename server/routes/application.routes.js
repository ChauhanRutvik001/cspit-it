import express from "express";
import { isAuthorized, isAdmin, isCounsellor } from "../middlewares/auth.js";
import {
  submitApplication,
  getCompanyApplications,
  getCompaniesWithApplications,
  getUserApplications,
  cancelApplication,
  deleteApplication,
  counsellorApproval,
  getCounsellorPendingApplications
} from "../controllers/applicationController.js";

const router = express.Router();

// Submit an application
router.post("/submit", isAuthorized, submitApplication);

// Get counsellor's pending applications
router.get("/counsellor/pending", isAuthorized, isCounsellor, getCounsellorPendingApplications);

// Counsellor approval for placed student application
router.patch("/:applicationId/counsellor-approval", isAuthorized, isCounsellor, counsellorApproval);

// Get all applications for a company
router.get("/company/:companyId", isAuthorized, getCompanyApplications);

// Get all companies with their application counts
router.get("/companies/stats", isAuthorized, getCompaniesWithApplications);

// Get applications for a specific user
router.get("/user/:userId", isAuthorized, getUserApplications);

// Cancel an application
router.delete("/cancel", isAuthorized, cancelApplication);

// Delete an application (admin only)
router.delete("/:id", isAuthorized, isAdmin, deleteApplication);

export default router; 