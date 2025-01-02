import express from "express";
import { isAuthorized,isAdmin } from "../middlewares/auth.js";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

// Pending request routes
router
  .route("/bulk-register")
  .post(isAuthorized, isAdmin, adminController.BulkRequests);
router
  .route("/get-students-by-admin")
  .post(isAuthorized,isAdmin, adminController.getStudents);
router
  .route("/remove-user/:userId")
  .delete(isAuthorized,isAdmin, adminController.removeUser);

export default router;