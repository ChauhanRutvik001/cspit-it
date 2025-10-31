import Complaint from "../models/complaint.js";
import User from "../models/user.js";
import PlacementDrive from "../models/PlacementDrive.js";

// Submit a new complaint (Student)
export const submitComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, relatedPlacementDrive } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required"
      });
    }

    // Generate unique complaint ID
    const complaintId = Complaint.generateComplaintId();

    // Create new complaint
    const newComplaint = new Complaint({
      complaintId,
      title,
      description,
      category,
      priority: priority || "Medium",
      relatedPlacementDrive: relatedPlacementDrive || undefined
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully. Your complaint ID is: " + complaintId,
      data: {
        complaintId,
        status: "Pending"
      }
    });

  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message
    });
  }
};

// Get complaint status by ID (Student)
export const getComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({ complaintId }).select(
      "complaintId title category status adminResponse resolvedAt createdAt"
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found with this ID"
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });

  } catch (error) {
    console.error("Error fetching complaint status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint status",
      error: error.message
    });
  }
};

// Get all complaints for admin
export const getAllComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .populate("handledBy", "name email")
      .populate("relatedPlacementDrive", "title company")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComplaints = await Complaint.countDocuments(filter);
    const totalPages = Math.ceil(totalComplaints / limit);

    res.status(200).json({
      success: true,
      data: {
        complaints,
        currentPage: parseInt(page),
        totalPages,
        totalComplaints,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message
    });
  }
};

// Update complaint status and response (Admin)
export const updateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, adminResponse, isPublic, internalNotes } = req.body;
    const adminId = req.user._id;

    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // Update complaint fields
    if (status) complaint.status = status;
    if (adminResponse) complaint.adminResponse = adminResponse;
    if (typeof isPublic === 'boolean') complaint.isPublic = isPublic;
    if (internalNotes) complaint.internalNotes = internalNotes;
    
    complaint.handledBy = adminId;
    
    if (status === "Resolved") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Populate the response with admin details
    await complaint.populate("handledBy", "name email");

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint
    });

  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update complaint",
      error: error.message
    });
  }
};

// Get public complaints board (All users)
export const getPublicComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    const filter = { 
      status: "Resolved", 
      isPublic: true,
      adminResponse: { $exists: true, $ne: "" }
    };
    
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .select("complaintId title description category adminResponse resolvedAt createdAt")
      .sort({ resolvedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComplaints = await Complaint.countDocuments(filter);
    const totalPages = Math.ceil(totalComplaints / limit);

    res.status(200).json({
      success: true,
      data: {
        complaints,
        currentPage: parseInt(page),
        totalPages,
        totalComplaints,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching public complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public complaints",
      error: error.message
    });
  }
};

// Get complaint statistics (Admin)
export const getComplaintStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: "Pending" });
    const resolvedComplaints = await Complaint.countDocuments({ status: "Resolved" });
    const underReviewComplaints = await Complaint.countDocuments({ status: "Under Review" });

    // Category wise count
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Monthly complaints trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalComplaints,
          pending: pendingComplaints,
          resolved: resolvedComplaints,
          underReview: underReviewComplaints
        },
        categoryStats,
        monthlyStats
      }
    });

  } catch (error) {
    console.error("Error fetching complaint stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint statistics",
      error: error.message
    });
  }
};

// Delete complaint (Admin only - soft delete by marking as closed)
export const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // Soft delete by marking as closed
    complaint.status = "Closed";
    complaint.handledBy = req.user._id;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete complaint",
      error: error.message
    });
  }
};