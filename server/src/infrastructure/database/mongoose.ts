import mongoose from "mongoose";
import { logger } from "../../infrastructure/di/container";

export const connectDatabase = async (uri: string): Promise<void> => {
    try {
        await mongoose.connect(uri);
        logger.info("Successfully connected to MongoDB")
    } catch (error) {
        logger.error("Failed to connect to MongoDB", { error })
        process.exit(1)
    }
};
