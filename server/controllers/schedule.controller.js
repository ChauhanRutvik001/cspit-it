import Schedule from '../models/Schedule.js';
import fs from 'fs';
import path from 'path';

// Create a schedule
export const createSchedule = async (req, res) => {
  try {
    const { notes } = req.body;
    console.log(notes)
    const files = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
    }));

    const schedule = new Schedule({ notes, files });
    await schedule.save();

    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving schedule.' });
  }
};

// Get all schedules
export const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching schedules.' });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id + "id")
    const schedule = await Schedule.findByIdAndDelete(id);
    console.log(schedule)

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    // Assuming the schedule object has a f
    // ile path stored, replace `schedule.filePath` with the actual field
    const filePath = schedule.filePath;

    // Check if the file exists and remove it
    if (filePath) {
      const fullPath = path.join(__dirname, 'uploads', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });
    }

    res.status(200).json({ message: 'Schedule deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting schedule.' });
  }
};

