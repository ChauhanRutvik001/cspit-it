import mongoose from "mongoose";

const PendingRequestSchema = new mongoose.Schema(
  {
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counsellorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PendingRequest", PendingRequestSchema);