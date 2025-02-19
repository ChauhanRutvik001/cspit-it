import Schedule from "../models/Schedule.js";
import fs from "fs";
import path from "path";

// Create a schedule
export const createSchedule = async (req, res) => {
  try {
    const { notes } = req.body;
    const files = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
    }));

    if (!files.length) {
      return res.status(400).json({ message: "Please upload at least one image file." });
    }

    const schedule = new Schedule({ notes, files });
    await schedule.save();

    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving schedule." });
  }
};

// Get all schedules
export const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching schedules." });
  }
};

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id + " id");

    const schedule = await Schedule.findByIdAndDelete(id);
    console.log(schedule);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Check if there are files associated with the schedule
    if (schedule.files && schedule.files.length > 0) {
      for (const file of schedule.files) {
        const filePath = file.url; // Extract file URL
        const fullPath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(filePath)
        ); // Adjusted file path
        console.log("Full path: " + fullPath);

        // Delete the file if it exists
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file.name}:`, err);
          } else {
            console.log(`File ${file.name} deleted successfully.`);
          }
        });
      }
    }

    console.log("Schedule and associated files deleted.");
    res
      .status(200)
      .json({ success: true, message: "Schedule deleted successfully." });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ message: "Error deleting schedule." });
  }
};
