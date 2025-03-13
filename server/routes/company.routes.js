import express from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  deleteCompany,
  updateCompany,
} from "../controllers/CompanyController.js";
import { approveCompany } from "../controllers/CompanyController.js";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthorized, isAdmin, createCompany); // Admin only
router.get("/list", isAuthorized, getCompanies); // Public (Students can access)
router.get("/:id", isAuthorized, getCompanyById); // Public
router.delete("/:id", isAuthorized, isAdmin, deleteCompany); // Admin only
router.put("/:id", isAuthorized, isAdmin, updateCompany); // ✅ Add this for editing company details
router.post("/approve", isAuthorized, approveCompany);

export default router;
