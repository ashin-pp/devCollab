import "dotenv/config";

export const envConfig = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/devcollab",
    jwtSecret: process.env.JWT_SECRET || "default_secret",
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || "15m",
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
    refreshCookieMaxAge: parseInt(process.env.REFRESH_COOKIE_MAX_AGE || "604800000", 10), // 7 days in ms
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development",
    
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    awsRegion: process.env.AWS_REGION || "",
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || "",
    
    groqApiKey: process.env.GROQ_API_KEY || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
};
