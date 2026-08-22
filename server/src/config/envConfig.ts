import "dotenv/config";

const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/^["']|["']$/g, "").trim();

/** CLIENT_URL plus www/apex twin + local Vite ports (CORS / Socket.IO). */
function buildAllowedOrigins(primary: string): string[] {
    const origins = new Set<string>([
        primary,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ]);

    try {
        const url = new URL(primary);
        const host = url.hostname;
        const altHost = host.startsWith("www.") ? host.slice(4) : `www.${host}`;
        origins.add(`${url.protocol}//${altHost}${url.port ? `:${url.port}` : ""}`);
    } catch {
        // ignore invalid CLIENT_URL
    }

    return [...origins];
}

export const envConfig = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/devcollab",
    jwtSecret: process.env.JWT_SECRET || "default_secret",
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || "15m",
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
    refreshCookieMaxAge: parseInt(process.env.REFRESH_COOKIE_MAX_AGE || "604800000", 10), // 7 days in ms
    clientUrl,
    allowedOrigins: buildAllowedOrigins(clientUrl),
    nodeEnv: process.env.NODE_ENV || "development",
    // HTTP localhost (Docker) cannot set Secure cookies; override with COOKIE_SECURE=true behind HTTPS.
    cookieSecure:
        process.env.COOKIE_SECURE === "true" ||
        (process.env.COOKIE_SECURE !== "false" &&
            (process.env.CLIENT_URL || "").startsWith("https")),
    
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    awsRegion: process.env.AWS_REGION || "",
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || "",
    
    groqApiKey: process.env.GROQ_API_KEY || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",

    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",

    /** Same Web client ID as VITE_GOOGLE_CLIENT_ID (verify Google ID tokens). */
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};
