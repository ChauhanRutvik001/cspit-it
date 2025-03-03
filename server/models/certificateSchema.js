import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fileType: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Certificate", CertificateSchema);