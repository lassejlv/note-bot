import { model, Schema } from "npm:mongoose";

const backupSchema = new Schema(
  {
    discord_id: { type: String, required: true },
    note_id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Backup", backupSchema);
