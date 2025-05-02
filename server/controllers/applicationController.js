import Application from "../models/application.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import { generateNotification } from "./notification.controller.js";
import Company from "../models/company.js";

// Submit an application
export const submitApplication = async (req, res) => {
  try {
    const { studentId, companyId } = req.body;
    
    // Check if student exists and is placed
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get company details for notification
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check for existing application
    const existingApplication = await Application.findOne({
      company: companyId,
      student: studentId
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this company" });
    }

    // Create application with appropriate status based on placement
    const application = new Application({
      company: companyId,
      student: studentId,
      status: student.isPlaced ? "pending" : "approved", // Automatically approve for non-placed students
      counsellorApproval: student.isPlaced ? false : null,
      counsellor: student.isPlaced ? student.profile?.counsellor : null
    });
    
    await application.save();

    // If student is placed, send notification to counsellor about pending approval
    if (student.isPlaced && student.profile?.counsellor) {
      const counsellorId = student.profile.counsellor;
      
      // Send notification to counsellor
      await generateNotification(
        counsellorId,
        `${student.name} has applied to ${company.name} and is awaiting your approval`,
        {
          type: "application",
          relatedId: application._id,
          relatedModel: "Application"
        }
      );
      
      console.log(`Notification sent to counsellor ${counsellorId} about application from ${student.name} to ${company.name}`);
    }

    // Return appropriate message
    const message = student.isPlaced 
      ? "Application submitted and pending approval" 
      : "Application submitted and approved successfully";

    res.status(201).json({ message, application });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Error submitting application" });
  }
};

// Counsellor approval for placed student application
export const counsellorApproval = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { approve } = req.body;
    const counsellorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await Application.findById(applicationId)
      .populate('student')
      .populate('company');

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    console.log('Counsellor IDs:', {
      requestCounsellor: counsellorId,
      applicationCounsellor: application.counsellor?.toString()
    });

    // Verify this is the correct counsellor
    if (!application.counsellor || application.counsellor.toString() !== counsellorId.toString()) {
      return res.status(403).json({ message: "Not authorized to approve this application" });
    }

    // Verify application is in pending status
    if (application.status !== "pending") {
      return res.status(400).json({ message: "Application is not pending approval" });
    }

    // Update the application status
    application.status = approve ? "approved" : "rejected";
    application.counsellorApproval = approve;
    await application.save();

    // Get counsellor's name for the notification
    const counsellor = await User.findById(counsellorId);
    
    // Send notification to the student about application approval/rejection
    if (application.student && application.student._id) {
      // Prepare notification message based on approval status
      const notificationMessage = approve
        ? `Your application to ${application.company.name} has been approved by counsellor ${counsellor ? counsellor.name : ''}`
        : `Your application to ${application.company.name} has been rejected by counsellor ${counsellor ? counsellor.name : ''}`;
      
      // Send the notification
      await generateNotification(
        application.student._id,
        notificationMessage,
        {
          type: "application",
          relatedId: application._id,
          relatedModel: "Application"
        }
      );
      
      console.log(`Notification sent to student ${application.student._id} about ${approve ? 'approval' : 'rejection'} of application to ${application.company.name}`);
    }

    res.status(200).json({ 
      message: approve ? "Application approved successfully" : "Application rejected",
      application
    });

  } catch (error) {
    console.error("Error in counsellor approval:", error);
    res.status(500).json({ message: "Error processing approval" });
  }
};

// Cancel an application
export const cancelApplication = async (req, res) => {
  try {
    const { studentId, companyId } = req.body;
    
    console.log('Cancel Application Request:', {
      studentId,
      companyId
    });

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid student ID or company ID" });
    }

    const result = await Application.findOneAndDelete({
      company: new mongoose.Types.ObjectId(companyId),
      student: new mongoose.Types.ObjectId(studentId)
    });

    console.log('Found application:', result);

    if (!result) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.status(200).json({ message: "Application cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling application:", error);
    res.status(500).json({ message: "Error cancelling application" });
  }
};

// Get all applications for a company
export const getCompanyApplications = async (req, res) => {
  try {
    const { companyId } = req.params;
    const applications = await Application.find({ company: companyId })
      .populate('student', 'name email profile') // Include student details
      .sort('-appliedAt');
    
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Get applications for a specific user
export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    const applications = await Application.find({ student: userId })
      .select('company status appliedAt')
      .sort('-appliedAt');
    
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Get all companies with their application counts
export const getCompaniesWithApplications = async (req, res) => {
  try {
    const applications = await Application.aggregate([
      {
        $group: {
          _id: "$company",
          totalApplications: { $sum: 1 },
          pendingApplications: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          approvedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "companies",
          localField: "_id",
          foreignField: "_id",
          as: "companyDetails"
        }
      },
      {
        $unwind: "$companyDetails"
      }
    ]);
    
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching companies with applications:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
};

// Delete an application by ID (admin only)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Application.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ message: "Error deleting application" });
  }
};

// Get pending applications for a counsellor
export const getCounsellorPendingApplications = async (req, res) => {
  try {
    const counsellorId = req.user.id; // Use the authenticated user's ID
    
    // Verify counsellorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(counsellorId)) {
      return res.status(400).json({ message: "Invalid counsellor ID" });
    }

    const applications = await Application.find({
      status: "pending",
      counsellor: new mongoose.Types.ObjectId(counsellorId)
    })
    .populate('student', 'name email profile')
    .populate('company', 'name')
    .sort('-appliedAt');
    
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching counsellor applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};