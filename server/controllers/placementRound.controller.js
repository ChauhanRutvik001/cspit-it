import PlacementRound from "../models/PlacementRound.js";
import PlacementDrive from "../models/PlacementDrive.js";
import StudentRoundProgress from "../models/StudentRoundProgress.js";
import User from "../models/user.js";

// Create a new placement round
export const createPlacementRound = async (req, res) => {
  try {
    const {
      placementDrive,
      roundNumber,
      roundName,
      roundType,
      description,
      instructions,
      duration,
      maxMarks,
      passingMarks,
      scheduledDate,
      scheduledTime,
      venue
    } = req.body;

    // Validate round number
    if (roundNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Round number must be 1 or greater"
      });
    }

    // Load placement drive to enforce total rounds and date window
    const drive = await PlacementDrive.findById(placementDrive).select('totalRounds startDate endDate');
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    // Check if round number already exists for this drive
    const existingRound = await PlacementRound.findOne({
      placementDrive,
      roundNumber
    });

    console.log(`Checking for existing round: placementDrive=${placementDrive}, roundNumber=${roundNumber}`);
    console.log(`Existing round found:`, existingRound ? existingRound._id : 'None');

    if (existingRound) {
      return res.status(400).json({
        success: false,
        message: `Round ${roundNumber} already exists for this placement drive. Please use a different round number.`
      });
    }

    // Get all rounds for this drive to ensure proper sequencing and sequential numbering
    const allRoundsForDrive = await PlacementRound.find({ placementDrive }).sort({ roundNumber: 1 });
    console.log(`All existing rounds for this drive:`, allRoundsForDrive.map(r => ({ id: r._id, roundNumber: r.roundNumber, name: r.roundName })));
    console.log(`All rounds for this drive:`, allRoundsForDrive.map(r => r.roundNumber));
    
    // Enforce totalRounds limit
    if (allRoundsForDrive.length >= drive.totalRounds) {
      return res.status(400).json({
        success: false,
        message: `This drive allows a maximum of ${drive.totalRounds} rounds. You cannot add more rounds.`
      });
    }

    // Check if this is the first round (should be round 1)
    if (allRoundsForDrive.length === 0 && roundNumber !== 1) {
      return res.status(400).json({
        success: false,
        message: "First round for a placement drive must be round 1"
      });
    }
    
    // Check if round number is sequential
    if (allRoundsForDrive.length > 0) {
      const expectedNextRound = Math.max(...allRoundsForDrive.map(r => r.roundNumber)) + 1;
      if (roundNumber !== expectedNextRound) {
        return res.status(400).json({
          success: false,
          message: `Expected round number ${expectedNextRound}, but got ${roundNumber}. Rounds must be sequential.`
        });
      }
    }

    // Validate scheduled date within drive window and strictly increasing
    const newRoundDate = new Date(scheduledDate);
    const driveStart = new Date(drive.startDate);
    const driveEnd = new Date(drive.endDate);
    if (isNaN(newRoundDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid scheduledDate' });
    }
    if (newRoundDate < driveStart || newRoundDate > driveEnd) {
      return res.status(400).json({
        success: false,
        message: 'Round scheduledDate must be within the drive start and end dates'
      });
    }
    if (allRoundsForDrive.length > 0) {
      const lastRound = allRoundsForDrive[allRoundsForDrive.length - 1];
      const lastDate = new Date(lastRound.scheduledDate || lastRound.createdAt);
      if (!(newRoundDate >= lastDate)) {
        return res.status(400).json({
          success: false,
          message: `Round ${roundNumber} must be scheduled after Round ${lastRound.roundNumber}`
        });
      }
    }

    const placementRound = new PlacementRound({
      placementDrive,
      roundNumber,
      roundName,
      roundType,
      description,
      instructions,
      duration,
      maxMarks,
      passingMarks,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      venue,
      createdBy: req.user.id
    });

    try {
      await placementRound.save();
    } catch (error) {
      // Handle duplicate key error specifically
      if (error.code === 11000) {
        console.error('Duplicate key error:', error);
        return res.status(400).json({
          success: false,
          message: `Round ${roundNumber} already exists for this placement drive. Please use a different round number.`
        });
      }
      throw error; // Re-throw other errors
    }

    // Update student progress to include this new round
    await updateStudentProgressForNewRound(placementDrive, roundNumber, roundName);

    res.status(201).json({
      success: true,
      message: "Placement round created successfully",
      data: placementRound
    });
  } catch (error) {
    console.error("Error creating placement round:", error);
    res.status(500).json({
      success: false,
      message: "Error creating placement round",
      error: error.message
    });
  }
};

// Update student progress for new round
const updateStudentProgressForNewRound = async (placementDriveId, roundNumber, roundName) => {
  try {
    await StudentRoundProgress.updateMany(
      { placementDrive: placementDriveId },
      {
        $push: {
          roundProgress: {
            roundNumber,
            roundName,
            status: 'pending'
          }
        }
      }
    );
  } catch (error) {
    console.error("Error updating student progress for new round:", error);
  }
};

// Get all rounds for a placement drive
export const getPlacementDriveRounds = async (req, res) => {
  try {
    const { driveId } = req.params;
    
    const rounds = await PlacementRound.find({ placementDrive: driveId })
      .sort({ roundNumber: 1 });

    res.status(200).json({
      success: true,
      data: rounds
    });
  } catch (error) {
    console.error("Error fetching placement rounds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching placement rounds",
      error: error.message
    });
  }
};

// Update placement round
export const updatePlacementRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const updateData = req.body;

    // Load the round and drive for validation
    const existing = await PlacementRound.findById(roundId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Placement round not found"
      });
    }

    const drive = await PlacementDrive.findById(existing.placementDrive).select('startDate endDate totalRounds');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    // If scheduledDate is being updated, validate date window and ordering
    let nextScheduledDate = updateData.scheduledDate ? new Date(updateData.scheduledDate) : new Date(existing.scheduledDate);
    if (isNaN(nextScheduledDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid scheduledDate' });
    }
    const driveStart = new Date(drive.startDate);
    const driveEnd = new Date(drive.endDate);
    if (nextScheduledDate < driveStart || nextScheduledDate > driveEnd) {
      return res.status(400).json({
        success: false,
        message: 'Round scheduledDate must be within the drive start and end dates'
      });
    }

    // Ensure this round's date is after previous and before next rounds (if any)
    const siblings = await PlacementRound.find({ placementDrive: existing.placementDrive }).sort({ roundNumber: 1 });
    const index = siblings.findIndex(r => r._id.toString() === roundId);
    const prevRound = index > 0 ? siblings[index - 1] : null;
    const nextRound = index < siblings.length - 1 ? siblings[index + 1] : null;

    if (prevRound) {
      const prevDate = new Date(prevRound.scheduledDate || prevRound.createdAt);
      if (!(nextScheduledDate >= prevDate)) {
        return res.status(400).json({
          success: false,
          message: `Round ${existing.roundNumber} must be scheduled after Round ${prevRound.roundNumber}`
        });
      }
    }
    if (nextRound) {
      const nxtDate = new Date(nextRound.scheduledDate || nextRound.createdAt);
      if (!(nextScheduledDate < nxtDate)) {
        return res.status(400).json({
          success: false,
          message: `Round ${existing.roundNumber} must be scheduled before Round ${nextRound.roundNumber}`
        });
      }
    }

    const placementRound = await PlacementRound.findByIdAndUpdate(
      roundId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!placementRound) {
      return res.status(404).json({
        success: false,
        message: "Placement round not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Placement round updated successfully",
      data: placementRound
    });
  } catch (error) {
    console.error("Error updating placement round:", error);
    res.status(500).json({
      success: false,
      message: "Error updating placement round",
      error: error.message
    });
  }
};

// Delete placement round
export const deletePlacementRound = async (req, res) => {
  try {
    const { roundId } = req.params;

    const placementRound = await PlacementRound.findById(roundId);
    if (!placementRound) {
      return res.status(404).json({
        success: false,
        message: "Placement round not found"
      });
    }

    // Remove this round from all student progress
    await StudentRoundProgress.updateMany(
      { placementDrive: placementRound.placementDrive },
      {
        $pull: {
          roundProgress: { roundNumber: placementRound.roundNumber }
        }
      }
    );

    // Delete the round
    await PlacementRound.findByIdAndDelete(roundId);

    res.status(200).json({
      success: true,
      message: "Placement round deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting placement round:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting placement round",
      error: error.message
    });
  }
};

// Start a round (mark as in_progress)
export const startPlacementRound = async (req, res) => {
  try {
    const { roundId } = req.params;

    const placementRound = await PlacementRound.findByIdAndUpdate(
      roundId,
      { 
        status: 'in_progress',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!placementRound) {
      return res.status(404).json({
        success: false,
        message: "Placement round not found"
      });
    }

    // Update student progress status for this round - only for students who are actually participating
    // For round 1: all students in the drive
    // For round N (N>1): only students who were shortlisted from round N-1
    // if (placementRound.roundNumber === 1) {
    //   // Round 1: update all students in the drive
    //   await StudentRoundProgress.updateMany(
    //     { 
    //       placementDrive: placementRound.placementDrive,
    //       'roundProgress.roundNumber': placementRound.roundNumber
    //     },
    //     {
    //       $set: {
    //         'roundProgress.$.status': 'in_progress'
    //       }
    //     }
    //   );
    // } else {
    //   // Round N (N>1): only update students who were shortlisted from the previous round
    //   // First, find students who were shortlisted in the previous round
    //   const studentsInRound = await StudentRoundProgress.find({
    //     placementDrive: placementRound.placementDrive,
    //     'roundProgress.roundNumber': placementRound.roundNumber - 1,
    //     'roundProgress.status': 'shortlisted'
    //   });

    //   // Update only those students for the current round
    //   const studentIds = studentsInRound.map(s => s._id);
    //   if (studentIds.length > 0) {
    //     await StudentRoundProgress.updateMany(
    //       { 
    //         _id: { $in: studentIds },
    //         'roundProgress.roundNumber': placementRound.roundNumber
    //       },
    //       {
    //         $set: {
    //           'roundProgress.$.status': 'in_progress'
    //         }
    //       }
    //     );
    //   }
    // }

    res.status(200).json({
      success: true,
      message: "Placement round started successfully",
      data: placementRound
    });
  } catch (error) {
    console.error("Error starting placement round:", error);
    res.status(500).json({
      success: false,
      message: "Error starting placement round",
      error: error.message
    });
  }
};

// Complete a round and shortlist students
export const completePlacementRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { shortlistedStudents } = req.body; // Array of student IDs

    const placementRound = await PlacementRound.findByIdAndUpdate(
      roundId,
      { 
        status: 'completed',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!placementRound) {
      return res.status(404).json({
        success: false,
        message: "Placement round not found"
      });
    }

    // Update student progress for this round
    const updatePromises = shortlistedStudents.map(async (studentData) => {
      const { studentId, marksObtained, feedback, isShortlisted } = studentData;
      
      const updateQuery = {
        'roundProgress.$.status': isShortlisted ? 'shortlisted' : 'rejected',
        'roundProgress.$.marksObtained': marksObtained,
        'roundProgress.$.feedback': feedback,
        'roundProgress.$.evaluatedBy': req.user.id,
        'roundProgress.$.evaluatedAt': new Date(),
        'roundProgress.$.isShortlisted': isShortlisted
      };

      // Calculate percentage
      if (marksObtained && placementRound.maxMarks) {
        updateQuery['roundProgress.$.percentage'] = (marksObtained / placementRound.maxMarks) * 100;
      }

      await StudentRoundProgress.updateOne(
        { 
          student: studentId,
          placementDrive: placementRound.placementDrive,
          'roundProgress.roundNumber': placementRound.roundNumber
        },
        { $set: updateQuery }
      );

      // If shortlisted, check if this is the final round
      if (isShortlisted) {
        // Get placement drive info to check if this is the final round
        const placementDrive = await PlacementDrive.findById(placementRound.placementDrive).select('totalRounds company');
        const isFinalRound = placementRound.roundNumber >= placementDrive.totalRounds;
        
        if (isFinalRound) {
          // Student completed all rounds successfully - mark as selected and placed
          await StudentRoundProgress.updateOne(
            { 
              student: studentId,
              placementDrive: placementRound.placementDrive,
              'roundProgress.roundNumber': placementRound.roundNumber
            },
            { 
              $set: { 
                'roundProgress.$.status': 'shortlisted',
                overallStatus: 'placed',
                finalResult: 'selected',
                updatedAt: new Date()
              }
            }
          );
          
          // Update student's placement status in User model
          await User.findByIdAndUpdate(
            studentId,
            {
              $set: {
                isPlaced: true,
                placedDate: new Date(),
                placedCompany: placementDrive.company
              }
            }
          );
          
          console.log(`Student ${studentId} completed all rounds and is now placed`);
        } else {
          // Move to next round
          await StudentRoundProgress.updateOne(
            { 
              student: studentId,
              placementDrive: placementRound.placementDrive,
              'roundProgress.roundNumber': placementRound.roundNumber
            },
            { 
              $set: { 
                'roundProgress.$.status': 'shortlisted',
                updatedAt: new Date()
              }
            }
          );
          
          // Increment current round and add next round entry
          await StudentRoundProgress.updateOne(
            { 
              student: studentId,
              placementDrive: placementRound.placementDrive
            },
            {
              $inc: { currentRound: 1 },
              $push: {
                roundProgress: {
                  roundNumber: placementRound.roundNumber + 1,
                  roundName: `Round ${placementRound.roundNumber + 1}`,
                  status: 'pending',
                  isShortlisted: false,
                  marksObtained: 0,
                  maxMarks: 100,
                  percentage: 0
                }
              }
            }
          );
        }
      } else {
        // If rejected, mark overall status as rejected
        await StudentRoundProgress.updateOne(
          { 
            student: studentId,
            placementDrive: placementRound.placementDrive,
            'roundProgress.roundNumber': placementRound.roundNumber
          },
          { 
            $set: { 
              'roundProgress.$.status': 'rejected',
              overallStatus: 'rejected',
              finalResult: 'rejected',
              updatedAt: new Date()
            }
          }
        );
      }
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Placement round completed successfully",
      data: placementRound
    });
  } catch (error) {
    console.error("Error completing placement round:", error);
    res.status(500).json({
      success: false,
      message: "Error completing placement round",
      error: error.message
    });
  }
};

// Clean up orphaned placement rounds (utility function)
export const cleanupOrphanedRounds = async (req, res) => {
  try {
    // Find rounds that don't have a valid placementDrive reference
    const orphanedRounds = await PlacementRound.find({
      $or: [
        { placementDrive: null },
        { placementDrive: { $exists: false } }
      ]
    });

    if (orphanedRounds.length > 0) {
      console.log(`Found ${orphanedRounds.length} orphaned rounds, deleting them...`);
      await PlacementRound.deleteMany({
        $or: [
          { placementDrive: null },
          { placementDrive: { $exists: false } }
        ]
      });
    }

    res.status(200).json({
      success: true,
      message: `Cleaned up ${orphanedRounds.length} orphaned rounds`,
      data: { cleanedCount: orphanedRounds.length }
    });
  } catch (error) {
    console.error("Error cleaning up orphaned rounds:", error);
    res.status(500).json({
      success: false,
      message: "Error cleaning up orphaned rounds",
      error: error.message
    });
  }
};

// Get round details with student progress
export const getRoundDetails = async (req, res) => {
  try {
    const { roundId } = req.params;
    
    const placementRound = await PlacementRound.findById(roundId)
      .populate('placementDrive', 'title company');

    if (!placementRound) {
      return res.status(404).json({
        success: false,
        message: "Placement round not found"
      });
    }

    // Get student progress for this round
    const studentProgress = await StudentRoundProgress.find({
      placementDrive: placementRound.placementDrive._id,
      'roundProgress.roundNumber': placementRound.roundNumber
    })
    .populate('student', 'name email id profile')
    .sort({ 'roundProgress.$.marksObtained': -1 });

    res.status(200).json({
      success: true,
      data: {
        round: placementRound,
        studentProgress
      }
    });
  } catch (error) {
    console.error("Error fetching round details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching round details",
      error: error.message
    });
  }
};

