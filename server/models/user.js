import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../utils/constants.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
    },
    id: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "ID is required"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
      required: [true, "Role is required"],
    },
    firstTimeLogin: {
      type: Boolean,
      default: true,
    },
    firstTimeData: {
      type: Boolean,
      default: true,
    },
    profile: {
      avatar: {
        type: String, // URL or path to the user's avatar
      },
      semester: {
        type: Number,
        min: [1, "Semester must be between 1 and 8"],
        max: [8, "Semester must be between 1 and 8"],
      },
      birthDate: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
      },
      permanentAddress: {
        type: String,
      },
      personalEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      mobileNo: {
        type: String,
        match: [/^\d{10}$/, "Mobile Number must be a valid 10-digit number"],
      },
      counsellor: {
        type: String,
      },
      batch: {
        type: String,
        lowercase: true,
        enum: ["a1", "b1", "c1", "d1", "a2", "b2", "c2", "d2"],
      },
      github: {
        type: String,
      },
      linkedIn: {
        type: String,
      },
    },

    // Reference to Domain schema
    domains: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password, DBpassword) {
  return await bcrypt.compare(password, DBpassword);
};

export default mongoose.model("User", userSchema);
