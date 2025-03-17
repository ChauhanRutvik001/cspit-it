import User from "../models/user.js";
import { GridFSBucket } from "mongodb";
import { mongoose } from "../app.js";

export const getUserDetails = async (req, res) => {
  const id = req.user.id; // Updated to match :id in the route
  console.log("User ID:", id);

  try {
    // Find user by ID
    const user = await User.findById(id).select("name id email profile");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send response
    console.log("User details fetched successfully");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving user details",
    });
  }
};

export const uploadProfilePic = async (req, res) => {
  console.log("Api is hit");
  try {
    const userId = req.user.id;
    console.log("this is profileUSer: ", userId);
    const file = req.file;

    if (!userId || !file) {
      return res.status(400).json({ error: "User ID and file are required" });
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        "profile.avatar": file.id,
      },
    });

    res.json({
      message: "Avatar uploaded successfully",
      fileId: file.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfilePic = async (req, res) => {
  console.log("API hit OK");

  try {
    const userId = req.user.id;
    console.log("User ID:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fileId = user.profile?.avatar;
    console.log("Profile File ID:", fileId);

    if (!fileId) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    // Ensure fileId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const fileIdObject =
      fileId instanceof mongoose.Types.ObjectId
        ? fileId
        : new mongoose.Types.ObjectId(fileId);

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const fileStream = bucket.openDownloadStream(fileIdObject);
    res.set("Content-Type", "image/jpeg");

    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ error: "Failed to retrieve profile picture" });
      }
    });

    fileStream.on("end", () => {
      console.log("Profile picture stream completed.");
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Error fetching profile picture:", error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to retrieve profile picture" });
    }
  }
};

export const removeProfilePic = async (req, res, next) => {
  console.log("removeProfilePic API called");
  const startTime = Date.now();

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User does not exist." });
    }

    const fileId = user.profile?.avatar;
    if (!fileId) {
      console.log("Avatar not found");
      return res.status(404).json({ message: "Avatar does not exist." });
    }

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      console.log("Invalid file ID");
      return res.status(400).json({ message: "Invalid file ID" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
    console.log("Starting delete process at:", startTime);

    user.profile.avatar = null;
    await user.save();

    bucket.delete(new mongoose.Types.ObjectId(fileId), async (err) => {
      console.log("File deleted");
      if (err) {
        console.error("Error removing file:", err);
        return res.status(500).json({ message: "Error removing avatar." });
      }

      console.log("Till here");
      try {
        user.profile.avatar = null;
        await user.save();
      } catch (saveError) {
        console.error("Error saving user:", saveError);
        return res.status(500).json({ message: "Error saving user." });
      }

      const endTime = Date.now();
      console.log(`Avatar removed successfully in ${endTime - startTime}ms`);

      return res.status(200).json({ message: "Avatar removed successfully." });
    });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.user; // Authenticated user's ID
  const allowedUpdates = [
    "name",
    "profile.gender",
    "profile.permanentAddress",
    "profile.birthDate",
    "profile.counsellor",
    "profile.batch",
    "profile.mobileNo",
    "profile.semester",
    "profile.github",
    "profile.linkedIn",
  ];

  try {
    const updates = req.body;

    // Normalize keys by mapping flat keys to nested keys
    const normalizedUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(`profile.${key}`)) {
        console.log("Key:", key);
        normalizedUpdates[`profile.${key}`] = updates[key];
      } else if (allowedUpdates.includes(key)) {
        normalizedUpdates[key] = updates[key];
      }
    });

    // Validate allowed updates
    const keysToUpdate = Object.keys(normalizedUpdates);
    const isValidOperation = keysToUpdate.every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates provided." });
    }

    // Fetch and update user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.profile = user.profile || {};

    // ✅ Update fields correctly
    keysToUpdate.forEach((key) => {
      const keys = key.split(".");
      if (keys.length === 1) {
        console.log("hello", keys);
        user[keys[0]] = normalizedUpdates[key];
      } else {
        console.log("helol" + keys);
        user.profile[keys[1]] = normalizedUpdates[key]; // Correctly updating profile fields
      }
    });

    await user.save();
    console.log("User updated successfully:", user);

    return res.status(200).json({
      message: "User updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const getAllStudents = async (req, res) => {
  
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber <= 0 ||
      limitNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit parameter",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;
    
    // Define a consistent query filter to use in both operations
    const queryFilter = { role: "student" };

    const students = await User.find(queryFilter)
      .select("name id profile certificates resume passwordChanged")
      .populate("profile.counsellor", "name") // Populate counsellor with name
      .skip(skip)
      .limit(limitNumber)
      .lean();

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No students with profiles found" });
    }

    // Modify student data based on password change and handle missing data
    const studentsWithCertLength = students.map((student) => {
      // Extract counsellor information
      const counsellor = student.profile?.counsellor;
      const counsellorName = counsellor ? counsellor.name : "-";
      
      return {
        name: student.name || "-",
        id: student.id || "-",
        _id: student._id || "-",
        profile: {
          ...student.profile,
          // Replace counsellor object with just the name for cleaner response
          counsellor: counsellorName
        } || "-",
        certificatesLength: student.certificates
          ? student.certificates.length
          : 0,
        resume: student.resume && student.resume.length > 0,
      };
    });

    // Get the total count of students using the same filter as the find query
    const totalStudents = await User.countDocuments(queryFilter);
    console.log("Total students:", totalStudents);

    // Send response with paginated data and metadata
    res.status(200).json({
      success: true,
      data: studentsWithCertLength,
      meta: {
        totalStudents,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalStudents / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching students data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving student details",
    });
  }
};

export const getProfilePicByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const stream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
    stream.on("error", () => res.status(404).json({ error: "File not found" }));

    res.set("Content-Type", "application/octet-stream");
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving file" });
  }
};

export const getProfileCounsellor = async (req, res) => {
  try {
    const counsellors = await User.find({ role: "counsellor" }).select(
      "id name _id"
    );

    if (!counsellors || counsellors.length === 0) {
      return res.status(404).json({ message: "No counsellors found" });
    }

    return res.status(200).json({
      success: true,
      data: counsellors,
    });
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCounsellorStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const counsellorId = req.user.id;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber <= 0 ||
      limitNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit parameter",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;
    
    // Define a consistent query filter for both operations
    const queryFilter = {
      role: "student",
      "profile.counsellor": counsellorId
    };

    const students = await User.find(queryFilter)
      .select("name id profile certificates resume passwordChanged")
      .skip(skip)
      .limit(limitNumber)
      .lean();

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No students with profiles found" });
    }

    // Get the counsellor's name to include in the response
    const counsellor = await User.findById(counsellorId).select("name").lean();
    const counsellorName = counsellor ? counsellor.name : "Unknown";

    // Modify student data based on password change and handle missing data
    const studentsWithCertLength = students.map((student) => ({
      name: student.name || "-",
      id: student.id || "-",
      _id: student._id || "-",
      profile: {
        ...student.profile,
        counsellor: counsellorName // Add counsellor name to profile
      } || "-",
      certificatesLength: student.certificates
        ? student.certificates.length
        : 0,
      resume: student.resume && student.resume.length > 0,
    }));

    // Get the total count using the same filter
    const totalStudents = await User.countDocuments(queryFilter);
    console.log("Total assigned students:", totalStudents);

    // Send response with paginated data and metadata
    res.status(200).json({
      success: true,
      data: studentsWithCertLength,
      meta: {
        counsellorName,
        totalStudents,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalStudents / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching students data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving student details",
    });
  }
};
