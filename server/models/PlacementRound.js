import mongoose from "mongoose";

const placementRoundSchema = new mongoose.Schema({
  placementDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlacementDrive",
    required: true
  },
  roundNumber: {
    type: Number,
    required: true
  },
  roundName: {
    type: String,
    required: true,
    trim: true
  },
  roundType: {
    type: String,
    enum: ['aptitude', 'coding', 'technical', 'hr', 'group_discussion', 'presentation', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: ""
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  passingMarks: {
    type: Number,
    default: 50
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // "10:00 AM" format
    required: true
  },
  venue: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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

// Ensure unique round number per placement drive
placementRoundSchema.index({ placementDrive: 1, roundNumber: 1 }, { unique: true });

// Drop any old conflicting indexes (this will be handled by MongoDB)
placementRoundSchema.on('index', function(error) {
  if (error) {
    console.log('Index creation error:', error);
  }
});

const PlacementRound = mongoose.model("PlacementRound", placementRoundSchema);

export default PlacementRound;

