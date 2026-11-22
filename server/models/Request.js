import mongoose from "mongoose";
const { Schema } = mongoose;

const requestSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tags: [String],
    category: { type: String, default: "Other" },
    urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    location: { type: String, default: "Remote" },
    summary: String,
    status: {
      type: String,
      enum: ["open", "in_progress", "solved"],
      default: "open",
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    helpers: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],
    solvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    solvedAt: Date,
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("HelpRequest", requestSchema);
