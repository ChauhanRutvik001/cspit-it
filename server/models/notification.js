import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["certificate", "company", "application", "resume", "student", "general", "placement_drive", "student_status", "placement_update"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["Certificate", "User", "Company", "Resume", "Application", "PlacementDrive", "StudentRoundProgress"],
    },
  },
  { timestamps: true }
);

// Index for faster queries by recipient
NotificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;