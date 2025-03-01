import express from "express";
import {
  uploadProfilePic,
  getProfilePic,
  removeProfilePic,
  getUserDetails,
  updateUser,
  getAllStudents,
  getProfilePicByAdmin,
} from "../controllers/user.js";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";

import { upload } from "../utils/multer.utils.js";

const router = express.Router();

router.get("/getStudentData/:id", isAuthorized, getUserDetails); //Profile.jsx

router.put("/update", isAuthorized, updateUser); //Profile.jsx

router.post("/upload-avatar",isAuthorized,upload.single("avatar"),uploadProfilePic); //ProfileLeft.jsx

router.get("/profile/upload-avatar", isAuthorized, getProfilePic); //ProfileLeft.jsx and Header.jsx

router.delete("/profile/remove-profile-pic", isAuthorized, removeProfilePic); //ProfileLeft.jsx

router.get("/profile/getAllstudent", isAuthorized, isAdmin, getAllStudents); //StudentData.jsx

router.get("/profile/getProfilePicByAdmin/:id",isAuthorized,getProfilePicByAdmin); //StudentData.jsx


export default router;
