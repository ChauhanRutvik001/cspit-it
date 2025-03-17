import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  description: { type: String, required: true },
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  website: { type: String },
  linkedin: { type: String },
  approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Company", companySchema);