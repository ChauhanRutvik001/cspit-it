import express from "express";
import { login, logout, getCurrentUser, changePassword } from "../controllers/auth.js";
import { isAuthorized } from '../middlewares/auth.js';

const router = express.Router();

router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/get-current-user").get(getCurrentUser);
router.route("/change-password").post(changePassword);
router.route("/profile-data").post(changePassword);


export default router;