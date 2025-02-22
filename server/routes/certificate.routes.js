import express from "express";
import {
  uploadCertificate,
  getCertificate,
  getCertificateFile,
  deleteCertificate,
  getUserCertificate
} from "../controllers/certificate.controller.js";
import { isAdmin, isAuthorized } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.utils.js";

const router = express.Router();

router.post("/upload", isAuthorized, upload.single("certificate"), uploadCertificate); //Certificate.jsx
router.get("/user", isAuthorized, getCertificate); //Certificate.jsx
router.get("/file/:fileId",isAuthorized, getCertificateFile); //Certificate.jsx
router.get("/getUserCertificate/:id",isAuthorized,isAdmin, getUserCertificate); //StudentCertificate.jsx
router.delete("/:certificateId", isAuthorized, deleteCertificate); //Certificate.jsx

export default router;
