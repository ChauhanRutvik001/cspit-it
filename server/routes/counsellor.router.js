import express from "express";
import { isAuthorized, isAdmin, isCounsellor } from "../middlewares/auth.js";
import adminController from "../controllers/admin.controller.js";
import counsellorController from "../controllers/counsellor.controller.js";

const router = express.Router();

// Pending request routes
router
  .route("/bulk-register")
  .post(isAuthorized, isAdmin, adminController.BulkRequests); //StudentRegistration.jsx
router
  .route("/get-students-by-admin")
  .post(isAuthorized, isAdmin, adminController.getStudents); //AdminPage.jsx
router
  .route("/remove-user/:userId")
  .delete(isAuthorized, isAdmin, adminController.removeUser); //AdminPage.jsx
router
  .route("/bulk-register-counsellor")
  .post(isAuthorized, isAdmin, adminController.BulkRequestsCounsellor); //StudentRegistration.jsx
router
  .route("/get-faculty-by-admin")
  .post(isAuthorized, isAdmin, adminController.BulkRequestsCounsellor); //StudentRegistration.jsx

// Counsellor-only APIs
router
  .route("/my-students")
  .get(isAuthorized, isCounsellor, counsellorController.getMyStudents);
router
  .route("/my-students/progress")
  .get(isAuthorized, isCounsellor, counsellorController.getMyStudentsProgress);

export default router;
