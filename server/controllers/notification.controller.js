import Notification from "../models/notification.js";
import User from "../models/user.js";
import { io, connectedUsers } from "../app.js";

// Get all notifications for the current user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCount = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId,
      isRead: false 
    });
    
    return res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        total: totalCount,
        unread: unreadCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications"
    });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    notification.isRead = true;
    await notification.save();
    
    return res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Error marking notification as read"
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Error marking all notifications as read"
    });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { recipientId, message, type, relatedId, relatedModel } = req.body;
    
    const notification = new Notification({
      recipient: recipientId,
      message,
      type: type || "general",
      relatedId,
      relatedModel
    });
    
    await notification.save();
    
    // Send real-time notification if the user is connected
    const socketId = connectedUsers.get(recipientId);
    if (socketId) {
      io.to(socketId).emit('new-notification', notification);
    }
    
    return res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created successfully"
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating notification"
    });
  }
};

// Helper function to generate notifications (can be used from other controllers)
export const generateNotification = async (recipientId, message, options = {}) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      message,
      type: options.type || "general",
      relatedId: options.relatedId,
      relatedModel: options.relatedModel
    });
    
    const savedNotification = await notification.save();
    
    // Send real-time notification if the user is connected
    const socketId = connectedUsers.get(recipientId);
    if (socketId) {
      io.to(socketId).emit('new-notification', savedNotification);
    }
    
    return savedNotification;
  } catch (error) {
    console.error("Error generating notification:", error);
    return null;
  }
};

// For counselor: Generate notifications for all their students
export const notifyAllStudents = async (req, res) => {
  try {
    const counsellorId = req.user.id;
    const { message, type } = req.body;
    
    // Get all students assigned to this counselor
    const students = await User.find({
      role: "student",
      "profile.counsellor": counsellorId
    }).select("_id");
    
    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for this counsellor"
      });
    }
    
    // Create a notification for each student
    const notificationPromises = students.map(async (student) => {
      const notification = await generateNotification(student._id, message, { 
        type, 
        relatedId: counsellorId,
        relatedModel: "User"
      });
      return notification;
    });
    
    await Promise.all(notificationPromises);
    
    return res.status(200).json({
      success: true,
      message: `Notification sent to ${students.length} students`
    });
  } catch (error) {
    console.error("Error notifying students:", error);
    return res.status(500).json({
      success: false,
      message: "Error notifying students"
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    await notification.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting notification"
    });
  }
};

// Send notification when placement drive starts
export const notifyPlacementDriveStart = async (placementDriveId, companyId) => {
  try {
    console.log('Sending placement drive start notifications...');
    
    // Get company details
    const Company = (await import("../models/company.js")).default;
    const PlacementDrive = (await import("../models/PlacementDrive.js")).default;
    const Application = (await import("../models/application.js")).default;
    
    const company = await Company.findById(companyId);
    const placementDrive = await PlacementDrive.findById(placementDriveId);
    
    if (!company || !placementDrive) {
      console.error('Company or placement drive not found');
      return;
    }

    // Get all students who applied to this company
    const applications = await Application.find({ 
      company: companyId,
      status: 'approved'
    }).populate('student', '_id name email');

    // Get all counselors
    const counselors = await User.find({ 
      role: 'counsellor' 
    }).select('_id name email');

    const message = `🚀 Placement Drive Started! ${company.name} placement drive "${placementDrive.title}" has begun. Good luck to all participants!`;

    // Notify all applied students
    const studentNotifications = applications.map(async (application) => {
      return generateNotification(
        application.student._id,
        message,
        {
          type: "placement_drive",
          relatedId: placementDriveId,
          relatedModel: "PlacementDrive"
        }
      );
    });

    // Notify all counselors
    const counselorNotifications = counselors.map(async (counselor) => {
      return generateNotification(
        counselor._id,
        `📋 ${company.name} placement drive "${placementDrive.title}" has started with ${applications.length} student participants.`,
        {
          type: "placement_drive",
          relatedId: placementDriveId,
          relatedModel: "PlacementDrive"
        }
      );
    });

    // Send all notifications
    await Promise.all([...studentNotifications, ...counselorNotifications]);
    
    console.log(`Sent ${applications.length} notifications to students and ${counselors.length} notifications to counselors`);
    return true;
  } catch (error) {
    console.error("Error sending placement drive start notifications:", error);
    return false;
  }
};

// Send notification when student status changes (shortlisted/rejected/placed)
export const notifyStudentStatusChange = async (studentId, status, placementDriveId, roundNumber = null, companyName = '') => {
  try {
    console.log('Sending student status change notification...', { studentId, status, placementDriveId, roundNumber });
    
    // Get student details
    const student = await User.findById(studentId).populate('profile.counsellor', '_id name email');
    
    if (!student) {
      console.error('Student not found');
      return;
    }

    let message = '';
    let notificationType = "student_status";

    // Generate appropriate message based on status
    switch (status) {
      case 'shortlisted':
        message = `🎉 Congratulations! You have been shortlisted for ${companyName}${roundNumber ? ` - Round ${roundNumber}` : ''}. Prepare for the next stage!`;
        break;
      case 'rejected':
        message = `😔 Unfortunately, you were not selected for ${companyName}${roundNumber ? ` - Round ${roundNumber}` : ''}. Keep applying and don't give up!`;
        break;
      case 'placed':
        message = `🎊 CONGRATULATIONS! You have been successfully placed at ${companyName}! Your hard work has paid off!`;
        notificationType = "placement_update";
        break;
      default:
        message = `📝 Your status for ${companyName} has been updated${roundNumber ? ` - Round ${roundNumber}` : ''}.`;
    }

    // Notify the student
    await generateNotification(
      studentId,
      message,
      {
        type: notificationType,
        relatedId: placementDriveId,
        relatedModel: "PlacementDrive"
      }
    );

    // Notify the student's counselor if exists
    if (student.profile.counsellor) {
      const counselorMessage = `📋 Student Update: ${student.name} (${student.id}) has been ${status} for ${companyName}${roundNumber ? ` - Round ${roundNumber}` : ''}.`;
      
      await generateNotification(
        student.profile.counsellor._id,
        counselorMessage,
        {
          type: notificationType,
          relatedId: studentId,
          relatedModel: "User"
        }
      );
    }

    console.log(`Sent status change notification to student and counselor for status: ${status}`);
    return true;
  } catch (error) {
    console.error("Error sending student status change notification:", error);
    return false;
  }
};