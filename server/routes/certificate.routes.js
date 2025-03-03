import express from "express";
import {
  uploadCertificate,
  updateCertificate,
  deleteCertificate,
  approveCertificate,
  declineCertificate,
  getCertificates,
  getPendingRequests,
  getCertificateFile
} from "../controllers/certificate.controller.js";
import { isAdmin, isCounsellor, isAuthorized } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.utils.js";

const router = express.Router();

// Route to handle certificate upload
router.post("/upload", isAuthorized, upload.single("certificate"), uploadCertificate);

// Route to update a certificate before approval
router.put("/update/:certificateId", isAuthorized, upload.single("certificate"), updateCertificate);

// Route to delete a certificate
router.delete("/:certificateId", isAuthorized, deleteCertificate);

// Route to get all certificates for the logged-in user
router.get("/", isAuthorized, getCertificates);

// Route to get a specific certificate file
router.get("/file/:fileId", isAuthorized, getCertificateFile);

// Route for counsellor to approve a certificate
router.patch("/approve/:requestId", isAuthorized, isCounsellor, approveCertificate);

// Route for counsellor to decline a certificate
router.patch("/decline/:requestId", isAuthorized, isCounsellor, declineCertificate);

// Route to get students with pending certificate requests for the counsellor
router.get("/students", isAuthorized, isCounsellor, getPendingRequests);

export default router;