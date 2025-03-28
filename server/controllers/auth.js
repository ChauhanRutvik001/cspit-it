import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { createToken, verifyToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import admin from "../config/firebase-admin.js"; // We'll create this next

export const login = async (req, res) => {
  console.log("API hit");
  const { id, password } = req.body;
  console.log("-->", req.ip);

  if (!id || !password) {
    return res.status(400).json({ message: "ID and password are required" });
  }

  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      const firstUser = new User({
        id,
        name: id,
        email: `${id}@charusat.edu.in`,
        password,
        role: "admin",
        firstTimeLogin: false,
        firstTimeData: false,
      });

      await firstUser.save();
      return res
        .status(200)
        .json({ message: "First user created and assigned as Admin" });
    }

    let user = await User.findOne({ id });

    if (!user) {
      return res.status(401).json({
        message: "Invalid ID or Password!",
        success: false,
      });
    }

    const isPasswordValid = await user.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid ID or Password!",
        success: false,
      });
    }

    if (user.firstTimeLogin) {
      return res.status(200).json({
        message: "Please change your password.",
        firstTimeLogin: true,
        success: true,
      });
    }

    const token = await createToken({ id: user._id });
    const oneDay = 1000 * 60 * 60 * 24;

    // Exclude password from the response
    const { password: _, ...userData } = user.toObject();

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + oneDay),
      })
      .json({
        message: "Welcome back!",
        firstTimeLogin: user.firstTimeLogin,
        user: userData,  // Send user data without password
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
    
    // Fetch user without password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    if (user.sessionId !== decoded.sessionId) {
      return res.status(401).json({
        message: "Already authorized",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      data: {
        user, // Directly sending the user object
      },
    });
  } catch (error) {
    console.log("Error found");
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};


export const updateUser = async (req, res) => {
  const { id } = req.body; // Assuming `id` is a custom string, not ObjectId
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

    // Ensure all required fields are provided
    for (const field of allowedUpdates) {
      const key = field.replace("profile.", ""); // Normalize key
      if (
        !(key in updates) ||
        updates[key] === undefined ||
        updates[key] === ""
      ) {
        return res.status(400).json({ message: `Field '${key}' is required.` });
      }
    }

    // Validate `semester` (must be between 1 and 8)
    if (
      updates.semester &&
      (isNaN(updates.semester) || updates.semester < 1 || updates.semester > 8)
    ) {
      return res
        .status(400)
        .json({ message: "Semester must be between 1 and 8." });
    }

    // Validate `batch` (must be A1-D1 or A2-D2)
    const validBatches = ["a1", "b1", "c1", "d1", "a2", "b2", "c2", "d2"];
    if (updates.batch && !validBatches.includes(updates.batch)) {
      return res
        .status(400)
        .json({ message: "Batch must be A1 to D1 or A2 to D2." });
    }

    // Validate `mobileNo` (must be exactly 10 digits)
    if (updates.mobileNo && !/^\d{10}$/.test(updates.mobileNo)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be exactly 10 digits." });
    }

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
    user.firstTimeData =
      user.firstTimeData !== false ? false : user.firstTimeData;

    await user.save();
    console.log("User updated successfully:", user);

    return res.status(200).json({
      message: "User updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        id: user.id,
        role: user.role,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: "ID token is required", success: false });
    }
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;
    
    // Check if a user with this email exists
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        message: "No account registered with this Google email. Please contact admin.",
        success: false
      });
    }
    
    // Create JWT token for our application
    const token = await createToken({ id: user._id });
    const oneDay = 1000 * 60 * 60 * 24;
    
    // Exclude password from the response
    const { password: _, ...userData } = user.toObject();
    
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + oneDay),
      })
      .json({
        message: "Google login successful!",
        user: userData,
        success: true,
      });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      message: "An error occurred during Google login. Please try again later.",
      success: false,
    });
  }
};
