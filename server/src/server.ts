import "dotenv/config";

import app from "./app";
import { logger } from "./container";
import { connectDatabase } from "./infra/database/mongoose";
import { envConfig } from "./infra/config/envConfig";

const PORT = envConfig.port;
const MONGO_URI = envConfig.mongoUri;

const startServer = async () => {
    await connectDatabase(MONGO_URI);

    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();
