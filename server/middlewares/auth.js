import User from "../models/user.js";
import { verifyToken } from "../utils/jwt.js";


export const isAuthorized = async (req, res, next) => {
    try{
        console.log(req.headers.cookie)
        if (!req.headers.cookie) {
            console.log("Unauthorized error: TOKEN NOT FOUND");
        };
        const token = req.headers.cookie.slice(6);
        const decoded = await verifyToken(token);
        const user = await User.findById(decoded.id, { password: 0 });
        if (!user){
            console.log("Unauthorized error: USER NOT FOUND");
        };
        req.user = {
            id: user._id,
        };
        next();
    }
    catch (error) {
        console.log("Unauthorized error: ");
    }
};

export const isAdmin = (req, res, next) => {
  console.log('Checking admin access for user:', req.user);
  if (req.user && req.user.isAdmin === "admin") {
    console.log("User is admin. Access granted.");
    return next();
  }
  console.log("User is not admin. Access denied.");
  return res.status(403).json({ error: "You are not allowed to access this route" });
};




