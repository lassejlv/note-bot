import mongoose from "npm:mongoose";
// @ts-ignore
import { Logger } from "npm:term-logger@latest"

export const connectDatabase = async () => {
  await mongoose.connect(Deno.env.get("DATABASE_URL") as string)
  
  if (mongoose.connection.readyState === 1) {
    Logger.success("Connected to database")
  }
};
