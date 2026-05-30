import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { logger } from "./container";
import { connectDatabase } from "./infra/database/mongoose";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/devcollab";

const startServer = async () => {
    await connectDatabase(MONGO_URI);

    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();
