import jwt from "jsonwebtoken";

export const createToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXP,
  });
  return token;
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err.message);
        return reject(new Error("Invalid or expired token"));
      }
      resolve(decoded);
    });
  });
};
