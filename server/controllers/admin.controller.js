import User from "../models/user.js";
import bcrypt from "bcrypt";

const adminController = {
  BulkRequests: async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or missing students data." });
    }

    try {
      const results = { success: [], errors: [] };

      // Bulk register students
      for (const student of students) {
        const { name, id } = student;

        if (!name || !id) {
          results.errors.push({ id, message: "Incomplete student data." });
          continue;
        }

        const role = "student";
        const password = id;
        const emailDomain = "@charusat.edu.in";
        const email = `${id}${emailDomain}`;

        try {
          // Check if the student already exists
          const existingUser = await User.findOne({ id });
          if (existingUser) {
            results.errors.push({ id, message: "User already exists." });
            continue;
          }

          // Create and save new user
          const newUser = new User({
            name,
            id,
            email,
            password,
            role,
          });

          await newUser.save();
          results.success.push({
            id,
            message: "User registered successfully.",
          });
        } catch (error) {
          results.errors.push({ id, message: "Error registering user." });
        }
      }

      res.json({ message: "Bulk registration completed.", results });
    } catch (error) {
      console.error("Error in bulk registration:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  getStudents: async (req, res) => {
    const { page = 1, limit = 10 } = req.body;
    console.log("Page:", page, "Limit:", limit);

    try {
      const skip = (page - 1) * limit;

      const studentsQuery = { role: "student", isApproved: true };

      const students = await User.find(studentsQuery)
        .select("name _id id createdAt") // Only fetch the specific fields
        .sort({ id : 1 })
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
      const user = await User.findById(userId); // Assuming `userId` is an ObjectId
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      console.log("User found:", user);
      const userName = user.id;

      // Remove the user
      await User.deleteOne({ _id: userId }); // Assuming `_id` is the field for user ID

      return res.status(200).json({
        success: true,
        message: `User with ID ${userName} and all related data have been successfully removed.`,
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

export default adminController;
