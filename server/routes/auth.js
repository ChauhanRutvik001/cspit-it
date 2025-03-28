import express from "express";
import { login, logout, getCurrentUser, changePassword, updateUser, googleLogin } from "../controllers/auth.js";
import { isAuthorized } from '../middlewares/auth.js';

const router = express.Router();

router.route("/login").post(login); //Login.jsx
router.route("/google-login").post(googleLogin); // New Google login route
router.route("/logout").get(logout); //Header.jsx
router.route("/get-current-user").get(getCurrentUser); //auth.js
router.route("/change-password").post(changePassword); //PassWordChange.jsx
router.route("/enter-data").post(updateUser); //EnterDataForm.jsx

export default router;