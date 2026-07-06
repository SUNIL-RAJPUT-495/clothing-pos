import mongoose from "mongoose";

export const db = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");
    }
    catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};