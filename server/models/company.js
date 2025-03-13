import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  salary: { type: Number, required: true },
  approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Company", companySchema);