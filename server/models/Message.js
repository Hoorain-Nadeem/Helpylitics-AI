import mongoose from "mongoose";
const { Schema } = mongoose;
export default mongoose.model(
  "Message",
  new Schema(
    {
      from: { type: Schema.Types.ObjectId, ref: "User", required: true },
      to: { type: Schema.Types.ObjectId, ref: "User", required: true },
      request: { type: Schema.Types.ObjectId, ref: "HelpRequest" },
      text: { type: String, required: true },
      read: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
