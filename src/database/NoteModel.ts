import { model, Schema } from "npm:mongoose";

const noteSchema = new Schema(
  {
    shortId: { type: String, required: true, unique: true },
    discord_id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    privacy: {
      type: String,
      required: true,
      enum: ["public", "private"],
      default: "public",
    }
  },
  { timestamps: true }
);

export default model("Note", noteSchema);
