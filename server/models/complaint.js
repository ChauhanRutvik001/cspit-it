import mongoose from "mongoose";

const { Schema } = mongoose;

const complaintSchema = new Schema(
  {
    // Anonymous tracking ID for the student to check status
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },
    
    // Title of the complaint
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    
    // Detailed description of the complaint
    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    
    // Category of complaint
    category: {
      type: String,
      enum: [
        "Unfair Behavior",
        "Cheating in Placement Drive", 
        "Mobile Phone Usage During Exam",
        "Misconduct",
        "Faculty Related",
        "Placement Process",
        "Infrastructure",
        "Other"
      ],
      required: [true, "Complaint category is required"]
    },
    
    // Priority level
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    
    // Status of the complaint
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Resolved", "Closed"],
      default: "Pending"
    },
    
    // Admin response
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [1500, "Admin response cannot exceed 1500 characters"]
    },
    
    // Admin who handled the complaint (for internal tracking only)
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    // When the complaint was resolved
    resolvedAt: {
      type: Date
    },
    
    // Whether this complaint should be visible on public board
    isPublic: {
      type: Boolean,
      default: false
    },
    
    // Internal notes for admin (not visible to students)
    internalNotes: {
      type: String,
      trim: true
    },
    
    // Related placement drive (if applicable)
    relatedPlacementDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive"
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ isPublic: 1 });
complaintSchema.index({ createdAt: -1 });

// Static method to generate unique complaint ID
complaintSchema.statics.generateComplaintId = function() {
  const prefix = "COMP";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Instance method to mark as resolved
complaintSchema.methods.markAsResolved = function(adminResponse, handledBy) {
  this.status = "Resolved";
  this.adminResponse = adminResponse;
  this.handledBy = handledBy;
  this.resolvedAt = new Date();
  return this.save();
};

export default mongoose.model("Complaint", complaintSchema);