import User from "../models/user.js";
import { verifyToken } from "../utils/jwt.js";

export const isAuthorized = async (req, res, next) => {
  try {
    // Try to get token from cookies first (preferred method)
    let token = req.cookies.token;
    
    // If not found in cookies, try to extract from cookie header
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token not found" });
    }

    const decoded = await verifyToken(token);

    const user = await User.findById(decoded.id, { password: 0 });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = {
      id: user._id,
      role: user.role, // Add role information
      isAdmin: user.role === "admin", // Optionally, you can directly set isAdmin flag
    };

    next();
  } catch (error) {
    console.error("Unauthorized error: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const isAdmin = (req, res, next) => {
  // console.log("Checking admin access for user:", req.user);

  if (req.user && req.user.role === "admin") {
    console.log("User is admin. Access granted.");
    return next();
  }

  // console.log("User is not admin. Access denied.");
  return res
    .status(403)
    .json({ error: "You are not allowed to access this route" });
};

export const isCounsellor = (req, res, next) => {
  // console.log("Checking counsellor access for user:", req.user);

  if (req.user && req.user.role === "counsellor") {
    console.log("User is counsellor. Access granted.");
    return next();
  }

  // console.log("User is not counsellor. Access denied.");
  return res
    .status(403)
    .json({ error: "You are not allowed to access this route" });
};