import express from "express";
import {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
} from "../controllers/test.controller.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllTests);
router.get("/:id", getTestById);

// Admin only routes
router.post("/", isAuthorized, isAdmin, createTest);
router.put("/:id", isAuthorized, isAdmin, updateTest);
router.delete("/:id", isAuthorized, isAdmin, deleteTest);

export default router; 