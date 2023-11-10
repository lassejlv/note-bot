import { model, Schema } from "npm:mongoose@latest";

const remindSchema = new Schema(
  {
    noteId: {
      type: String,
      required: true,
    },
    remindAt: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Remind", remindSchema);
