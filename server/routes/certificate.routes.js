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

router.post("/upload", isAuthorized, upload.single("certificate"), uploadCertificate);
router.get("/user", isAuthorized, getCertificate);
router.get("/file/:fileId",isAuthorized, getCertificateFile);
router.get("/getUserCertificate/:id",isAuthorized,isAdmin, getUserCertificate);
router.delete("/:certificateId", isAuthorized, deleteCertificate);

export default router;
