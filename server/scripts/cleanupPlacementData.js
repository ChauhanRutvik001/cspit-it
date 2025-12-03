import mongoose from "mongoose";
import { config } from "dotenv";
import User from "../models/user.js";
import PlacementDrive from "../models/PlacementDrive.js";
import PlacementRound from "../models/PlacementRound.js";
import StudentRoundProgress from "../models/StudentRoundProgress.js";
import Application from "../models/application.js";
import Company from "../models/company.js";
import Notification from "../models/notification.js";

config();

const MONGO_URI = process.env.MONGO_URI;

async function cleanupPlacementData() {
  try {
    console.log("🧹 Starting placement data cleanup...");
    
    // Step 1: Find all placed students and unplace them
    console.log("📋 Finding and unplacing all students...");
    const placedStudents = await User.find({ 
      role: 'student', 
      isPlaced: true 
    });
    
    console.log(`Found ${placedStudents.length} placed students`);
    
    if (placedStudents.length > 0) {
      await User.updateMany(
        { 
          role: 'student', 
          isPlaced: true 
        },
        {
          $set: {
            isPlaced: false,
          },
          $unset: {
            placedDate: 1,
            placedCompany: 1
          }
        }
      );
      console.log(`✅ Unplaced ${placedStudents.length} students`);
    }

    // Step 2: Delete all student round progress
    console.log("🗑️ Deleting student round progress...");
    const progressCount = await StudentRoundProgress.countDocuments();
    await StudentRoundProgress.deleteMany({});
    console.log(`✅ Deleted ${progressCount} student progress records`);

    // Step 3: Delete all placement rounds
    console.log("🗑️ Deleting placement rounds...");
    const roundsCount = await PlacementRound.countDocuments();
    await PlacementRound.deleteMany({});
    console.log(`✅ Deleted ${roundsCount} placement rounds`);

    // Step 4: Delete all placement drives
    console.log("🗑️ Deleting placement drives...");
    const drivesCount = await PlacementDrive.countDocuments();
    await PlacementDrive.deleteMany({});
    console.log(`✅ Deleted ${drivesCount} placement drives`);

    // Step 5: Reset placement-related applications to approved status
    console.log("🔄 Resetting placed/rejected applications to approved...");
    const resetResult = await Application.updateMany(
      {
        status: { $in: ['placed', 'rejected'] }
      },
      {
        $set: {
          status: 'approved'
        }
      }
    );
    console.log(`✅ Reset ${resetResult.modifiedCount} applications to approved`);

    // Step 6: Delete placement-related notifications
    console.log("🗑️ Deleting placement notifications...");
    const notificationCount = await Notification.deleteMany({
      type: { 
        $in: [
          'placement_drive_created',
          'placement_drive_started', 
          'student_shortlisted',
          'student_rejected',
          'student_placed',
          'round_completed',
          'placement_drive_completed'
        ]
      }
    });
    console.log(`✅ Deleted ${notificationCount.deletedCount} placement notifications`);

    // Step 7: Optional - Delete all companies (uncomment if needed)
    // console.log("🗑️ Deleting all companies...");
    // const companiesCount = await Company.countDocuments();
    // await Company.deleteMany({});
    // console.log(`✅ Deleted ${companiesCount} companies`);

    console.log("\n🎉 Cleanup completed successfully!");
    console.log("Summary:");
    console.log(`- Unplaced students: ${placedStudents.length}`);
    console.log(`- Deleted student progress: ${progressCount}`);
    console.log(`- Deleted placement rounds: ${roundsCount}`);
    console.log(`- Deleted placement drives: ${drivesCount}`);
    console.log(`- Reset applications: ${resetResult.modifiedCount}`);
    console.log(`- Deleted notifications: ${notificationCount.deletedCount}`);

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

async function main() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI missing in environment");
    process.exit(1);
  }

  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await cleanupPlacementData();

  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the cleanup
main().catch(console.error);