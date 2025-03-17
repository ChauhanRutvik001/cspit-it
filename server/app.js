import "express-async-errors";
import { config } from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.router.js";
import scheduleRoutes from "./routes/schedule.router.js";
import user from "./routes/user.js";
import studentSelectionRoutes from "./routes/studentSelectionRoutes.js";
import certificateRoutes from "./routes/certificate.routes.js"; // Add this import
import resumeRoutes from "./routes/resume.routes.js";
import testRoutes from "./routes/test.routes.js";
import companyRoutes from "./routes/company.routes.js"; // ✅ Company Routes
import applicationRoutes from "./routes/application.routes.js"; // ✅ Application Routes

// Load environment variables
config();

const app = express();

// Middleware configurations
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// CORS setup
const corsOptions = {
  origin: "http://localhost:5173", // Update with your frontend URL
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/user", user);
app.use("/api/v1/studentSelection", studentSelectionRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/tests", testRoutes);
app.use("/api/v1/company", companyRoutes); // ✅ Added Company Routes
app.use("/api/v1/application", applicationRoutes); // ✅ Added Application Routes

// Database connection and server initialization
const PORT = process.env.PORT || 3100;
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

export { mongoose };
