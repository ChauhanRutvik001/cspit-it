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