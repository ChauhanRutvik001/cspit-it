import PlacementDrive from "../models/PlacementDrive.js";
import PlacementRound from "../models/PlacementRound.js";
import StudentRoundProgress from "../models/StudentRoundProgress.js";
import Application from "../models/application.js";
import User from "../models/user.js";
import { notifyPlacementDriveStart, notifyStudentStatusChange } from "./notification.controller.js";

// Create a new placement drive
export const createPlacementDrive = async (req, res) => {
  try {
    const {
      company,
      title,
      description,
      startDate,
      endDate,
      totalRounds
    } = req.body;

    const placementDrive = new PlacementDrive({
      company,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalRounds,
      createdBy: req.user.id
    });

    await placementDrive.save();

    // Create initial round progress for all students who applied to this company
    await initializeStudentProgress(placementDrive._id, company);

    // Send notifications to students and counselors about placement drive start
    await notifyPlacementDriveStart(placementDrive._id, company);

    res.status(201).json({
      success: true,
      message: "Placement drive created successfully",
      data: placementDrive
    });
  } catch (error) {
    console.error("Error creating placement drive:", error);
    res.status(500).json({
      success: false,
      message: "Error creating placement drive",
      error: error.message
    });
  }
};

// Initialize student progress for all applicants
const initializeStudentProgress = async (placementDriveId, companyId) => {
  try {
    // Get all approved applications for this company
    const applications = await Application.find({
      company: companyId,
      status: 'approved'
    }).populate('student');

    console.log(`Found ${applications.length} approved applications for company ${companyId}`);

    // Create progress records for each student
    const progressPromises = applications.map(async (application) => {
      const existingProgress = await StudentRoundProgress.findOne({
        student: application.student._id,
        placementDrive: placementDriveId
      });

      if (!existingProgress) {
        const studentProgress = new StudentRoundProgress({
          student: application.student._id,
          placementDrive: placementDriveId,
          currentRound: 1,
          roundProgress: [{
            roundNumber: 1,
            roundName: "Round 1",
            status: 'pending'
          }]
        });
        return studentProgress.save();
      }
    });

    const results = await Promise.all(progressPromises);
    const createdCount = results.filter(result => result !== undefined).length;
    console.log(`Created ${createdCount} student progress records`);
  } catch (error) {
    console.error("Error initializing student progress:", error);
  }
};

// Get all placement drives for a company
export const getCompanyPlacementDrives = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const placementDrives = await PlacementDrive.find({ company: companyId })
      .populate('company', 'name domain')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: placementDrives
    });
  } catch (error) {
    console.error("Error fetching placement drives:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching placement drives",
      error: error.message
    });
  }
};

// Get placement drive details with rounds
export const getPlacementDriveDetails = async (req, res) => {
  try {
    const { driveId } = req.params;
    
    const placementDrive = await PlacementDrive.findById(driveId)
      .populate('company', 'name domain description salary website linkedin');

    if (!placementDrive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found"
      });
    }

    // Get all rounds for this drive
    const rounds = await PlacementRound.find({ placementDrive: driveId })
      .sort({ roundNumber: 1 });

    // Get student progress summary
    const studentProgress = await StudentRoundProgress.find({ placementDrive: driveId })
      .populate('student', 'name email id')
      .sort({ currentRound: -1, averagePercentage: -1 });

    res.status(200).json({
      success: true,
      data: {
        placementDrive,
        rounds,
        studentProgress
      }
    });
  } catch (error) {
    console.error("Error fetching placement drive details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching placement drive details",
      error: error.message
    });
  }
};

// Update placement drive
export const updatePlacementDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const updateData = req.body;

    const placementDrive = await PlacementDrive.findByIdAndUpdate(
      driveId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!placementDrive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Placement drive updated successfully",
      data: placementDrive
    });
  } catch (error) {
    console.error("Error updating placement drive:", error);
    res.status(500).json({
      success: false,
      message: "Error updating placement drive",
      error: error.message
    });
  }
};

// Delete placement drive
export const deletePlacementDrive = async (req, res) => {
  try {
    const { driveId } = req.params;

    // Delete related data
    await Promise.all([
      PlacementRound.deleteMany({ placementDrive: driveId }),
      StudentRoundProgress.deleteMany({ placementDrive: driveId }),
      PlacementDrive.findByIdAndDelete(driveId)
    ]);

    res.status(200).json({
      success: true,
      message: "Placement drive deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting placement drive:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting placement drive",
      error: error.message
    });
  }
};

// Get all placement drives (admin view)
export const getAllPlacementDrives = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, company } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (company) filter.company = company;

    const placementDrives = await PlacementDrive.find(filter)
      .populate('company', 'name domain')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PlacementDrive.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: placementDrives,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDrives: total
      }
    });
  } catch (error) {
    console.error("Error fetching all placement drives:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching placement drives",
      error: error.message
    });
  }
};

// Get students in a specific round
export const getStudentsInRound = async (req, res) => {
  try {
    const { driveId, roundNumber } = req.params;
    console.log(`Getting students for drive ${driveId}, round ${roundNumber}`);

    const students = await StudentRoundProgress.find({
      placementDrive: driveId,
      currentRound: parseInt(roundNumber)
    })
    .populate('student', 'fullName email enrollmentNumber branch semester cgpa profile')
    .sort({ createdAt: 1 });

    console.log(`Found ${students.length} students in round ${roundNumber}`);

    res.status(200).json({
      success: true,
      students: students,  // Changed from 'data' to 'students' to match frontend expectation
      count: students.length
    });
  } catch (error) {
    console.error("Error fetching students in round:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students in round",
      error: error.message
    });
  }
};

// Test endpoint to check if controller is working
export const testEndpoint = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Test endpoint working",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Test endpoint error",
      error: error.message
    });
  }
};

// Get all placement drives visible to students (public view)
export const getStudentPlacementDrives = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, company } = req.query;
    const skip = (page - 1) * limit;

    let filter = { status: { $in: ['active', 'in_progress', 'completed'] } };
    if (status) filter.status = status;
    if (company) filter.company = company;

    const placementDrives = await PlacementDrive.find(filter)
      .populate('company', 'name domain logo')
      .select('title description startDate endDate status totalRounds company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PlacementDrive.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: placementDrives,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDrives: total
      }
    });
  } catch (error) {
    console.error("Error fetching student placement drives:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching placement drives",
      error: error.message
    });
  }
};

// Get student's progress in a specific placement drive
export const getStudentProgress = async (req, res) => {
  try {
    const { driveId } = req.params;
    const studentId = req.user.id;

    const studentProgress = await StudentRoundProgress.findOne({
      student: studentId,
      placementDrive: driveId
    })
    .populate('placementDrive', 'title company status totalRounds')
    .populate('placementDrive.company', 'name domain');

    if (!studentProgress) {
      return res.status(404).json({
        success: false,
        message: "No progress found for this placement drive"
      });
    }

    res.status(200).json({
      success: true,
      data: studentProgress
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student progress",
      error: error.message
    });
  }
};

// Get student's progress in all placement drives
export const getAllStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const studentProgress = await StudentRoundProgress.find({
      student: studentId
    })
    .populate('placementDrive', 'title company status totalRounds startDate endDate')
    .populate('placementDrive.company', 'name domain logo')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: studentProgress
    });
  } catch (error) {
    console.error("Error fetching all student progress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student progress",
      error: error.message
    });
  }
};

// Get placement drive details for students (limited information)
export const getStudentPlacementDriveDetails = async (req, res) => {
  try {
    const { driveId } = req.params;

    const placementDrive = await PlacementDrive.findById(driveId)
      .populate('company', 'name domain logo description')
      .populate('rounds', 'roundNumber roundName roundType scheduledDate status')
      .select('title description startDate endDate status totalRounds company rounds');

    if (!placementDrive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found"
      });
    }

    res.status(200).json({
      success: true,
      data: placementDrive
    });
  } catch (error) {
    console.error("Error fetching placement drive details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching placement drive details",
      error: error.message
    });
  }
};

// 
// ed students for a round
export const uploadShortlistedStudents = async (req, res) => {
  try {
    const { driveId, roundNumber } = req.params;
    const { shortlistedStudentIds } = req.body; // Array of student IDs

    console.log('Upload shortlist request:', { driveId, roundNumber, shortlistedStudentIds });

    if (!shortlistedStudentIds || !Array.isArray(shortlistedStudentIds)) {
      return res.status(400).json({
        success: false,
        message: "Shortlisted student IDs array is required"
      });
    }

    // Get all students in current round
    const allStudents = await StudentRoundProgress.find({
      placementDrive: driveId,
      currentRound: parseInt(roundNumber)
    });

    console.log(`Found ${allStudents.length} students in round ${roundNumber}`);

    if (allStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found in the specified round"
      });
    }

    // Only process shortlisted students - don't auto-reject others
    const updatePromises = shortlistedStudentIds.map(async (studentId) => {
      try {
        const studentProgress = allStudents.find(s => s.student.toString() === studentId);
        if (!studentProgress) {
          console.log(`Student ${studentId} not found in round ${roundNumber}`);
          return;
        }

        console.log(`Processing shortlisted student ${studentId}`);
        
        // First, update the current round status to shortlisted
        const currentRoundUpdate = await StudentRoundProgress.updateOne(
          { 
            _id: studentProgress._id,
            'roundProgress.roundNumber': parseInt(roundNumber)
          },
          {
            $set: {
              'roundProgress.$.status': 'shortlisted',
              'roundProgress.$.isShortlisted': true,
              'roundProgress.$.evaluatedAt': new Date()
            }
          }
        );

        console.log(`Updated current round status for student ${studentId}:`, currentRoundUpdate);

        // Get placement drive info to check total rounds
        const placementDrive = await PlacementDrive.findById(driveId).select('totalRounds company').populate('company', 'name');
        
        // Check if this was the final round
        const isFinalRound = parseInt(roundNumber) >= placementDrive.totalRounds;
        
        if (isFinalRound) {
          // Student completed all rounds successfully - mark as selected
          await StudentRoundProgress.updateOne(
            { _id: studentProgress._id },
            {
              $set: {
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

          // Update application status to "placed"
          await Application.findOneAndUpdate(
            {
              student: studentId,
              company: placementDrive.company._id
            },
            {
              $set: {
                status: 'placed'
              }
            }
          );
          
          // Send placement notification
          await notifyStudentStatusChange(
            studentId, 
            'placed', 
            driveId, 
            parseInt(roundNumber), 
            placementDrive.company.name
          );
          
          console.log(`Student ${studentId} completed all rounds and is now placed`);
        } else {
          // Move to next round and add new round entry
          const nextRoundUpdate = await StudentRoundProgress.updateOne(
            { _id: studentProgress._id },
            {
              $inc: { currentRound: 1 },
              $set: {
                updatedAt: new Date()
              },
              $push: {
                roundProgress: {
                  roundNumber: parseInt(roundNumber) + 1,
                  roundName: `Round ${parseInt(roundNumber) + 1}`,
                  status: 'pending',
                  isShortlisted: false,
                  marksObtained: 0,
                  maxMarks: 100,
                  percentage: 0
                }
              }
            }
          );
          
          // Send shortlisted notification for non-final rounds
          await notifyStudentStatusChange(
            studentId, 
            'shortlisted', 
            driveId, 
            parseInt(roundNumber), 
            placementDrive.company.name
          );
          
          console.log(`Moved student ${studentId} to next round:`, nextRoundUpdate);
        }
      } catch (studentError) {
        console.error(`Error processing student ${studentId}:`, studentError);
        throw studentError;
      }
    });

    await Promise.all(updatePromises);

    console.log(`Successfully processed ${allStudents.length} students`);

    res.status(200).json({
      success: true,
      message: `Successfully shortlisted ${shortlistedStudentIds.length} students`,
      data: {
        shortlistedCount: shortlistedStudentIds.length,
        totalStudents: allStudents.length
      }
    });
  } catch (error) {
    console.error("Error uploading shortlisted students:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading shortlisted students",
      error: error.message
    });
  }
};

// Reject students for a specific round
export const rejectStudents = async (req, res) => {
  try {
    const { driveId, roundNumber } = req.params;
    const { rejectedStudentIds } = req.body; // Array of student IDs

    console.log('Reject students request:', { driveId, roundNumber, rejectedStudentIds });

    if (!rejectedStudentIds || !Array.isArray(rejectedStudentIds)) {
      return res.status(400).json({
        success: false,
        message: "Rejected student IDs array is required"
      });
    }

    // Get all students in current round
    const allStudents = await StudentRoundProgress.find({
      placementDrive: driveId,
      currentRound: parseInt(roundNumber)
    });

    console.log(`Found ${allStudents.length} students in round ${roundNumber}`);

    if (allStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found in the specified round"
      });
    }

    // Process rejected students
    const updatePromises = rejectedStudentIds.map(async (studentId) => {
      try {
        const studentProgress = allStudents.find(s => s.student.toString() === studentId);
        if (!studentProgress) {
          console.log(`Student ${studentId} not found in round ${roundNumber}`);
          return;
        }

        console.log(`Processing rejected student ${studentId}`);
        
        // Get placement drive info to get company name
        const placementDrive = await PlacementDrive.findById(driveId).select('company').populate('company', 'name');
        
        // Mark as rejected for current round
        const rejectUpdate = await StudentRoundProgress.updateOne(
          { 
            _id: studentProgress._id,
            'roundProgress.roundNumber': parseInt(roundNumber)
          },
          {
            $set: {
              'roundProgress.$.status': 'rejected',
              'roundProgress.$.isShortlisted': false,
              'roundProgress.$.evaluatedAt': new Date(),
              overallStatus: 'rejected',
              finalResult: 'rejected',
              updatedAt: new Date()
            }
          }
        );

        // Update application status to "rejected"
        await Application.findOneAndUpdate(
          {
            student: studentId,
            company: placementDrive.company._id
          },
          {
            $set: {
              status: 'rejected'
            }
          }
        );

        // Send rejection notification
        await notifyStudentStatusChange(
          studentId, 
          'rejected', 
          driveId, 
          parseInt(roundNumber), 
          placementDrive.company.name
        );

        console.log(`Rejected student ${studentId}:`, rejectUpdate);
      } catch (studentError) {
        console.error(`Error processing student ${studentId}:`, studentError);
        throw studentError;
      }
    });

    await Promise.all(updatePromises);

    console.log(`Successfully processed ${rejectedStudentIds.length} rejected students`);

    res.status(200).json({
      success: true,
      message: `Successfully rejected ${rejectedStudentIds.length} students`,
      data: {
        rejectedCount: rejectedStudentIds.length,
        totalStudents: allStudents.length
      }
    });
  } catch (error) {
    console.error("Error rejecting students:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting students",
      error: error.message
    });
  }
};

