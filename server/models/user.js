import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../utils/constants.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required"],
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
    profile: {
      avatar: {
        type: String, // URL or path to the user's avatar
      },
      semester: {
        type: Number,
        min: 1,
        max: 8,
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

userSchema.methods.comparePassword = async function (password, DBpassword) {
  const isMatch = await bcrypt.compare(password, DBpassword);
  return isMatch;
};

export default mongoose.model("User", userSchema);
