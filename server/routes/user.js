import express from "express";
import {
  uploadProfilePic,
  getProfilePic,
  removeProfilePic,
  getUserDetails,
  updateUser,
  getAllStudents
} from "../controllers/user.js";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";

import { upload } from "../utils/multer.utils.js"

const router = express.Router();

router.get('/getStudentData/:id', isAuthorized, getUserDetails);

router.put("/update",isAuthorized, updateUser);

router.post('/upload-avatar', isAuthorized, upload.single('avatar'), uploadProfilePic);

router.get('/profile/upload-avatar', isAuthorized, getProfilePic);

router.delete('/profile/remove-profile-pic', isAuthorized, removeProfilePic);

router.get('/profile/getAllstudent', isAuthorized,isAdmin, getAllStudents);


export default router;