import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    notes: {
      type: String,
      required: true,
    },
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
