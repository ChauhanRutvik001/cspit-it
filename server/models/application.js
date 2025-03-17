import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Company", 
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'approved' 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  counsellorApproval: {
    type: Boolean,
    default: null,
  },
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

// Ensure a student can only apply once to a company
applicationSchema.index({ company: 1, student: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application; 