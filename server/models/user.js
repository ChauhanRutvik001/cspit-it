import mongoose from "mongoose";
import { ROLES } from "../utils/constants.js"; // Assuming ROLES are predefined in constants.js
import bcrypt from "bcrypt";

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
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1, role: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } }
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
  console.log(password, DBpassword);
  const isMatch = await bcrypt.compare(password, DBpassword);
  return isMatch;
};

export default mongoose.model("User", userSchema);