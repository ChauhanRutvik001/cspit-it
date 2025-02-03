import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { createToken, verifyToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  console.log("API hit");
  const { id, password } = req.body;
  console.log("-->", req.ip);

  if (!id || !password) {
    return res.status(400).json({ message: "ID and password are required" });
  }

  try {
    // Check if there are any users in the database
    const userCount = await User.countDocuments();

    // If no users found, create the first user and assign them as admin
    if (userCount === 0) {
      const firstUser = new User({
        id,
        name: id, // You can customize the name or take it from the request body
        email: `${id}@charusat.edu.in`, // Customize or take email from the request
        password,
        role: "admin", // Assign first user as admin
        firstTimeLogin: false,
        firstTimeData: false,
      });

      await firstUser.save();
      return res
        .status(200)
        .json({ message: "First user created and assigned as Admin" });
    }

    // Find the user by ID
    let user = await User.findOne({ id });

    // If user not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid ID or Password!",
        success: false,
      });
    }

    // Check if the password is valid
    const isPasswordValid = await user.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid ID or Password!",
        success: false,
      });
    }

    // If it's the user's first time login, inform the frontend to show password change form
    if (user.firstTimeLogin) {
      return res.status(200).json({
        message: "Please change your password.",
        firstTimeLogin: true, // This will trigger the frontend to show the password change form
        success: true,
      });
    }

    if (user.firstTimeData) {
      return res.status(200).json({
        message: "Enter your data.",
        firstTimeData: true, // This will trigger the frontend to show the password change form
        success: true,
      });
    }

    // Create a JWT token
    const token = await createToken({ id: user._id });

    const oneDay = 1000 * 60 * 60 * 24;

    // Set the token in a cookie and send the response
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure cookies in production
        expires: new Date(Date.now() + oneDay), // Expire the cookie in one day
      })
      .json({
        message: "Welcome back!",
        firstTimeLogin: user.firstTimeLogin,
        firstTime: user.firstTime,
        user: {
          _id: user._id,
          name: user.name,
          id: user.id,
          role: user.role,
        },
        success: true,
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "An error occurred during login. Please try again later.",
      success: false,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "All fields are required.", success: false });
    }

    let email = `${oldPassword.toLowerCase()}@charusat.edu.in`;
    console.log(email);
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    const isPasswordValid = await user.comparePassword(
      oldPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Old password is not valid.", success: false });
    }

    if (newPassword === oldPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password.",
        success: false,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long.",
        success: false,
      });
    }

    user.password = newPassword;
    user.firstTimeLogin = false; // Only set this to false when the password is actually changed
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully!",
      success: true,
    });
  } catch (error) {
    console.error("PasswordChange error:", error);
    return res.status(500).json({
      message: "An error occurred while changing the password.",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.token;
  console.log("token", token);
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }
  console.log("logout hit");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid user",
        success: false,
      });
    }

    await User.updateOne({ _id: user._id }, { $set: { sessionId: null } });

    res.cookie("token", "logout", {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    console.log("logout success");
    return res
      .status(200)
      .json({ message: "Successfully logged out", success: true });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "An error occurred while logging out.",
      success: false,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    if (user.sessionId !== decoded.sessionId) {
      return res.status(401).json({
        message: "Already authorised",
        success: false,
      });
    }

    return res.status(200).json({
      user: {
        profile: user.profile,
        _id: user._id,
        username: user.username,
        id: user.id,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        batch: user.batch,
      },
      success: true,
    });
  } catch (error) {
    console.log("error found");
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.body; // Assuming `id` is the custom string, not ObjectId
  const allowedUpdates = [
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
    console.log("Updates received:", updates);

    // Normalize keys by mapping flat keys to nested keys
    const normalizedUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(`profile.${key}`)) {
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

    // Fetch and update user by custom `id`
    const user = await User.findOne({ id }); // Use `findOne` to search by custom `id`
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    keysToUpdate.forEach((key) => {
      const keys = key.split(".");
      if (keys.length === 1) {
        user[keys[0]] = normalizedUpdates[key];
      } else {
        user[keys[0]][keys[1]] = normalizedUpdates[key];
      }
    });

    // Only set `firstTimeData` to false if any of the data has actually changed
    user.firstTimeData = user.firstTimeData !== false ? false : user.firstTimeData;

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

