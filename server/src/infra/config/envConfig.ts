import "dotenv/config";

export const envConfig = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/devcollab",
    jwtSecret: process.env.JWT_SECRET || "default_secret",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development",
    
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
    
    groqApiKey: process.env.GROQ_API_KEY || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
};
