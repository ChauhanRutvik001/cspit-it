import "express-async-errors";
import { config } from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";


// Import routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.router.js";
import scheduleRoutes from "./routes/schedule.router.js";
import user from "./routes/user.js";
import studentSelectionRoutes from './routes/studentSelectionRoutes.js';

// Load environment variables
config();

const app = express();

// Resolve __dirname for ES Modules (to avoid errors with __dirname)
const __dirname = path.resolve();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    console.log('Uploads directory does not exist. Creating it...');
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
}

// Middleware configurations
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Static files configuration
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir)); // Static upload folder path

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
