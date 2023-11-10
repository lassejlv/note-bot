import mongoose from "npm:mongoose@latest";
// @ts-ignore
import { Logger } from "npm:term-logger@latest";

export const connectDatabase = async () => {
  await mongoose.connect(Deno.env.get("DATABASE_URL") as string, {
    // @ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  if (mongoose.connection.readyState === 1) {
    Logger.success("Connected to database");
  }
};
