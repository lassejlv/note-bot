import { model, Schema } from "npm:mongoose@latest";

const contentSchema = new Schema(
  {
    discord_id: { type: String, required: true },
    short_id: { type: String, required: true },
    note_id: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Content", contentSchema);
