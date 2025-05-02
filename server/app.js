import "express-async-errors";
import { config } from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.router.js";
import scheduleRoutes from "./routes/schedule.router.js";
import user from "./routes/user.js";
import studentSelectionRoutes from "./routes/studentSelectionRoutes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import testRoutes from "./routes/test.routes.js";
import companyRoutes from "./routes/company.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// Load environment variables
config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true
  }
});

// Store connected users with their socket ids
const connectedUsers = new Map();

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  // User authentication and association with their socket
  socket.on("authenticate", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from connected users map
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Export socket.io instance for use in other files
export { io, connectedUsers };

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
app.use("/api/v1/notifications", notificationRoutes); // ✅ Added Notification Routes

// Database connection and server initialization
const PORT = process.env.PORT || 3100;
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connected");
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

export { mongoose };
