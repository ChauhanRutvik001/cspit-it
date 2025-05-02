import express from "express";
import { isAuthorized, isAdmin, isCounsellor } from "../middlewares/auth.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  notifyAllStudents,
  deleteNotification
} from "../controllers/notification.controller.js";

const router = express.Router();

// Routes for all authenticated users
router.get("/", isAuthorized, getUserNotifications);
router.patch("/:notificationId/read", isAuthorized, markAsRead);
router.patch("/read-all", isAuthorized, markAllAsRead);
router.delete("/:notificationId", isAuthorized, deleteNotification);

// Admin and counsellor specific routes
router.post("/create", isAuthorized, isAdmin, createNotification);
router.post("/notify-students", isAuthorized, isCounsellor, notifyAllStudents);

export default router;