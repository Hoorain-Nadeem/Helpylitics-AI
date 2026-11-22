import mongoose from "mongoose";
const { Schema } = mongoose;
export default mongoose.model(
  "Notification",
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      type: {
        type: String,
        enum: ["new_request", "help_offer", "solved", "status", "system"],
        default: "system",
      },
      text: { type: String, required: true },
      link: { type: String, default: "" },
      read: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
