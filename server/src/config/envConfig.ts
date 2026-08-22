import "dotenv/config";

const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/^["']|["']$/g, "").trim();

function extraOriginsFromEnv(): string[] {
    return (process.env.EXTRA_CORS_ORIGINS || "")
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, "").replace(/\/$/, ""))
        .filter(Boolean);
}

/** CLIENT_URL plus www/apex twin, Amplify host, and local Vite (CORS / Socket.IO). */
function buildAllowedOrigins(primary: string): string[] {
    const origins = new Set<string>([
        primary,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://main.d26xua693trmrm.amplifyapp.com",
        "https://devcollab.space",
        "https://www.devcollab.space",
        ...extraOriginsFromEnv(),
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

const cookieSecure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" &&
        (process.env.CLIENT_URL || "").startsWith("https"));

/** Cross-site Amplify → api.* needs SameSite=None + Secure; local Vite uses lax. */
const cookieSameSite: "lax" | "none" | "strict" =
    process.env.COOKIE_SAME_SITE === "lax" ||
    process.env.COOKIE_SAME_SITE === "none" ||
    process.env.COOKIE_SAME_SITE === "strict"
        ? process.env.COOKIE_SAME_SITE
        : cookieSecure
          ? "none"
          : "lax";

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
    // HTTP localhost cannot set Secure cookies; COOKIE_SECURE=true behind HTTPS.
    cookieSecure,
    cookieSameSite,

    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    awsRegion: process.env.AWS_REGION || "",
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || "",

    groqApiKey: process.env.GROQ_API_KEY || "",
    // Groq retired llama-3.1-8b-instant (2026-08-16); default is their recommended replacement.
    groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    /** IANA zone for AI task/remind/schedule wall-clock times (default India). */
    appTimezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
    geminiApiKey: process.env.GEMINI_API_KEY || "",

    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",

    /** Same Web client ID as VITE_GOOGLE_CLIENT_ID (verify Google ID tokens). */
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};
