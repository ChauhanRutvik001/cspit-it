import mongoose from "mongoose";

const studentRoundProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  placementDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlacementDrive",
    required: true
  },
  currentRound: {
    type: Number,
    default: 1
  },
  roundProgress: [{
    roundNumber: {
      type: Number,
      required: true
    },
    roundName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'shortlisted', 'rejected', 'absent'],
      default: 'pending'
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    percentage: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      default: ""
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    evaluatedAt: {
      type: Date
    },
    attendedAt: {
      type: Date
    },
    isShortlisted: {
      type: Boolean,
      default: false
    }
  }],
  overallStatus: {
    type: String,
    enum: ['active', 'shortlisted', 'rejected', 'placed', 'withdrawn'],
    default: 'active'
  },
  finalResult: {
    type: String,
    enum: ['selected', 'rejected', 'pending'],
    default: 'pending'
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  averagePercentage: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique student per placement drive
studentRoundProgressSchema.index({ student: 1, placementDrive: 1 }, { unique: true });

// Index for efficient queries
studentRoundProgressSchema.index({ placementDrive: 1, currentRound: 1 });
studentRoundProgressSchema.index({ overallStatus: 1 });

const StudentRoundProgress = mongoose.model("StudentRoundProgress", studentRoundProgressSchema);

export default StudentRoundProgress;

