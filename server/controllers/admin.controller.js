import User from "../models/user.js";
import bcrypt from "bcrypt";
import Certificate from "../models/certificateSchema.js";
import Resume from "../models/Resume.js";
import DomainModel from "../models/StudentSelection.js";

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

  // BulkRequestsCounsellor: async (req, res) => {
  //   const { counsellors } = req.body;
  //   console.log("Counsellors:", counsellors);

  //   if (!counsellors || !Array.isArray(counsellors) || counsellors.length === 0) {
  //     return res
  //       .status(400)
  //       .json({ message: "Invalid or missing counsellors data." });
  //   }

  //   try {
  //     const results = { success: [], errors: [] };

  //     // Bulk register counsellors
  //     for (const counsellor of counsellors) {
  //       const { name, id } = counsellor;

  //       if (!name || !id) {
  //         results.errors.push({ id, message: "Incomplete counsellor data." });
  //         continue;
  //       }

  //       const role = "counsellor";
  //       const password = id;
  //       const emailDomain = "@charusat.edu.in";
  //       const email = `${id}${emailDomain}`;

  //       try {
  //         // Check if the counsellor already exists
  //         const existingUser = await User.findOne({ id });
  //         if (existingUser) {
  //           results.errors.push({ id, message: "User already exists." });
  //           continue;
  //         }

  //         // Create and save new counsellor
  //         const newUser = new User({
  //           name,
  //           id,
  //           email,
  //           password,
  //           role,
  //         });

  //         await newUser.save();
  //         results.success.push({
  //           id,
  //           message: "Counsellor registered successfully.",
  //         });
  //       } catch (error) {
  //         results.errors.push({ id, message: "Error registering counsellor." });
  //       }
  //     }

  //     res.json({ message: "Bulk registration completed.", results });
  //   } catch (error) {
  //     console.error("Error in bulk registration:", error);
  //     res.status(500).json({ message: "Internal server error." });
  //   }
  // },

  BulkRequestsCounsellor: async (req, res) => {
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

        const role = "counsellor";
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

  getCounsellor: async (req, res) => {
    const { page = 1, limit = 10 } = req.body;
    console.log("Page:", page, "Limit:", limit);

    try {
      const skip = (page - 1) * limit;

      const studentsQuery = { role: "counsellor", isApproved: true };

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

  updatePlacedStudents: async (req, res) => {
    try {
      const { students } = req.body;
      
      if (!students || !Array.isArray(students)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid data format. Expected an array of students.' 
        });
      }

      const emails = students.map(student => student.email);
      
      // Update all students in the list to be placed
      const result = await User.updateMany(
        { email: { $in: emails }, role: 'student' },
        { $set: { isPlaced: true } }
      );

      res.status(200).json({
        success: true,
        message: `Successfully updated ${result.modifiedCount} students`,
        updatedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error updating placed students:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating placed students' 
      });
    }
  },

  addSinglePlacedStudent: async (req, res) => {
    try {
      const { email, studentId } = req.body;
      
      if (!email && !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Either email or student ID is required'
        });
      }

      let query = {};
      if (email) {
        query = { email };
      } else {
        query = { id: studentId };
      }

      // Find and update the student
      const student = await User.findOneAndUpdate(
        { ...query, role: 'student' },
        { $set: { isPlaced: true, placedDate: new Date() } },
        { new: true }
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student successfully marked as placed',
        student: {
          name: student.name,
          email: student.email,
          id: student.id
        }
      });
    } catch (error) {
      console.error('Error adding placed student:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding placed student'
      });
    }
  },

  getPlacedStudents: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const skip = (page - 1) * limit;

      // Create search query
      let searchQuery = { 
        role: 'student',
        isPlaced: true
      };

      if (search) {
        searchQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } }
        ];
      }

      // Get placed students with pagination
      const students = await User.find(searchQuery)
        .select('name email id placedDate')
        .sort({ placedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalStudents = await User.countDocuments(searchQuery);

      res.status(200).json({
        success: true,
        students,
        totalStudents,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalStudents / limit)
      });
    } catch (error) {
      console.error('Error fetching placed students:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching placed students'
      });
    }
  },

  removeFromPlacedStudents: async (req, res) => {
    try {
      const { studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID is required"
        });
      }

      const student = await User.findOne({ id: studentId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found"
        });
      }

      // Update student's placement status
      student.isPlaced = false;
      student.placedDate = null;
      await student.save();

      return res.status(200).json({
        success: true,
        message: "Student removed from placed list successfully"
      });
    } catch (error) {
      console.error("Error removing student from placed list:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
};

export default adminController;
