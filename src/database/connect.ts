import mongoose from "npm:mongoose";

export const connectDatabase = async () => {
  await mongoose.connect(Deno.env.get("DATABASE_URL") as string)
  
  if (mongoose.connection.readyState === 1) {
    console.log("Connected to database")
  }
};
