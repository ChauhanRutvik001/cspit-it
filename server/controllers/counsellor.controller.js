import User from "../models/user.js";
import Certificate from "../models/certificateSchema.js";
import Resume from "../models/Resume.js";
import DomainModel from "../models/StudentSelection.js";
import StudentRoundProgress from "../models/StudentRoundProgress.js";
import PlacementDrive from "../models/PlacementDrive.js";

const CounsellorController = {
  getStudents: async (req, res) => {
    const { page = 1, limit = 10 } = req.body;
    console.log("Page:", page, "Limit:", limit);

    try {
      const skip = (page - 1) * limit;

      const studentsQuery = { role: "student", isApproved: true };

      const students = await User.find(studentsQuery)
        .select("name _id id createdAt") // Only fetch the specific fields
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit);

      const totalStudents = await User.countDocuments(studentsQuery);

      const totalPages = Math.ceil(totalStudents / limit);

      res.status(200).json({
        success: true,
        message: "Students fetched successfully.",
        students,
        totalPages,
        currentPage: page,
        totalStudents,
      });
    } catch (error) {
      console.error("Error in fetching students:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },

  // Get students under the counsellor (based on user.profile.counsellor)
  getMyStudents: async (req, res) => {
    try {
      const counsellorId = req.user.id;
      const students = await User.find({
        role: "student",
        isApproved: true,
        "profile.counsellor": counsellorId
      }).select("name _id id email");

      return res.status(200).json({ success: true, students });
    } catch (error) {
      console.error("Error fetching counsellor students:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // Get progress for all students under the counsellor across drives
  getMyStudentsProgress: async (req, res) => {
    try {
      const counsellorId = req.user.id;
      const students = await User.find({
        role: "student",
        isApproved: true,
        "profile.counsellor": counsellorId
      }).select("_id name id email");

      const studentIds = students.map(s => s._id);
      if (studentIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      const progress = await StudentRoundProgress.find({
        student: { $in: studentIds }
      })
        .populate("student", "name email id")
        .populate({
          path: "placementDrive",
          select: "title totalRounds company startDate endDate",
          populate: { path: "company", select: "name domain" }
        })
        .sort({ updatedAt: -1 });

      return res.status(200).json({ success: true, data: progress });
    } catch (error) {
      console.error("Error fetching counsellor students progress:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  removeUser: async (req, res) => {
    const { userId } = req.params;

    console.log("User ID received:", userId);

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing User ID." });
    }

    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      console.log("User found:", user);

      // Remove related certificates
      await Certificate.deleteMany({ uploadedBy: userId });

      // Remove related resume
      await Resume.deleteMany({ userId });

      // Remove domain model data
      await DomainModel.deleteMany({ studentId: userId });

      // Finally, remove the user
      await User.deleteOne({ _id: userId });

      return res.status(200).json({
        success: true,
        message: `User with ID ${userId} and all related data have been successfully removed.`,
      });
    } catch (error) {
      console.error("Error in removing user:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },
};

export default CounsellorController;
