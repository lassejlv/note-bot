import { model, Schema } from "npm:mongoose@latest";

const backupSchema = new Schema(
  {
    discord_id: { type: String, required: true },
    short_id: { type: String, required: true },
    note_id: { type: String, required: true },
    content_id: { type: String, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Backup", backupSchema);
