import User from "../models/user.js";
import { GridFSBucket } from "mongodb";
import { mongoose } from "../app.js";

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("name email id role profile isPlaced placedDate")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in getting user details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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

    const students = await User.find({
      role: "student",
    })
      .select("name id profile certificates resume passwordChanged isPlaced placedDate")
      .skip(skip)
      .limit(limitNumber)
      .lean();

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No students with profiles found" });
    }

    // Modify student data based on password change and handle missing data
    const studentsWithCertLength = students.map((student) => ({
      name: student.name || "-",
      id: student.id || "-",
      _id: student._id || "-",
      profile: student.profile || "-",
      certificatesLength: student.certificates ? student.certificates.length : 0,
      resume: student.resume && student.resume.length > 0,
      isPlaced: student.isPlaced || false,
      placedDate: student.placedDate || null
    }));

    // Get the total count of students
    const totalStudents = await User.countDocuments({
      role: "student",
      profile: { $exists: true, $ne: null },
    });

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
    const counsellorId = req.user.id; // Assuming req.user contains the authenticated user info

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

    const students = await User.find({
      role: "student",
      "profile.counsellor": counsellorId, // Filter by counsellor ID
    })
      .select("name id profile certificates resume passwordChanged isPlaced placedDate")
      .skip(skip)
      .limit(limitNumber)
      .lean(); // Convert MongoDB documents to plain JavaScript objects

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No students with profiles found" });
    }

    // Modify student data based on password change and handle missing data
    const studentsWithCertLength = students.map((student) => ({
      name: student.name || "-",
      id: student.id || "-",
      _id: student._id || "-",
      profile: student.profile || "-",
      certificatesLength: student.certificates ? student.certificates.length : 0,
      resume: student.resume && student.resume.length > 0,
      isPlaced: student.isPlaced || false,
      placedDate: student.placedDate || null
    }));

    // Get the total count of students
    const totalStudents = await User.countDocuments({
      role: "student",
      "profile.counsellor": counsellorId, // Filter by counsellor ID
      profile: { $exists: true, $ne: null },
    });

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
