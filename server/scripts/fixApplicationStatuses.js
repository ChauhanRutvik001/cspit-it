import mongoose from "mongoose";
import { config } from "dotenv";
import User from "../models/user.js";
import Application from "../models/application.js";

config();

const MONGO_URI = process.env.MONGO_URI;

async function fixApplicationStatuses() {
  try {
    console.log("🔧 Fixing application statuses for unplaced students...");
    
    // Find all unplaced students
    const unplacedStudents = await User.find({ 
      role: 'student', 
      isPlaced: false 
    }).select('_id name');
    
    console.log(`Found ${unplacedStudents.length} unplaced students`);
    
    if (unplacedStudents.length > 0) {
      const studentIds = unplacedStudents.map(student => student._id);
      
      // Update their applications from 'pending' to 'approved' where appropriate
      const updateResult = await Application.updateMany(
        {
          student: { $in: studentIds },
          status: 'pending'
        },
        {
          $set: {
            status: 'approved',
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} applications from pending to approved`);
      
      // Also check for any 'placed' or 'rejected' applications that should be 'approved'
      const cleanupResult = await Application.updateMany(
        {
          student: { $in: studentIds },
          status: { $in: ['placed', 'rejected'] }
        },
        {
          $set: {
            status: 'approved',
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Cleaned up ${cleanupResult.modifiedCount} stale applications to approved`);
    }
    
    console.log("🎉 Application status fix completed!");
    
  } catch (error) {
    console.error("❌ Error fixing application statuses:", error);
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

    await fixApplicationStatuses();

  } catch (error) {
    console.error("❌ Fix failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the fix
main().catch(console.error);