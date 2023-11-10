import { model, Schema } from "npm:mongoose@latest";

const cooldownSchema = new Schema(
  {
    discord_id: { type: String, required: true },
    time: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model("Cooldown", cooldownSchema);
