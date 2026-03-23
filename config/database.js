import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ;

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDatabase;