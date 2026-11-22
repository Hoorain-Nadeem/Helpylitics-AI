import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["need", "help", "both"], default: "both" },
    isAdmin: { type: Boolean, default: false },
    skills: [String],
    interests: [String],
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    onboarded: { type: Boolean, default: false },
    trustScore: { type: Number, default: 50 },
    points: { type: Number, default: 0 },
    helpedCount: { type: Number, default: 0 },
    badges: [String],
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matches = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
