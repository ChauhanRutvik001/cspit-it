import express from "express";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

// Placed students routes
router.get("/placed-students", isAuthorized, isAdmin, adminController.getPlacedStudents);
router.post("/placed-students/bulk", isAuthorized, isAdmin, adminController.updatePlacedStudents);
router.post("/placed-students/single", isAuthorized, isAdmin, adminController.addSinglePlacedStudent);
router.post("/placed-students/remove", isAuthorized, isAdmin, adminController.removeFromPlacedStudents);

// Other admin routes...
router.route("/bulk-register").post(isAuthorized, isAdmin, adminController.BulkRequests);
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
  .route("/get-counsellor-by-admin")
  .post(isAuthorized, isAdmin, adminController.getCounsellor); //AdminPage.jsx

export default router;
