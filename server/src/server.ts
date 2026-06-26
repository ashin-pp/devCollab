import "dotenv/config";

import app from "./app";
import { logger } from "./container";
import { connectDatabase } from "./infra/database/mongoose";
import { envConfig } from "./infra/config/envConfig";
import http from "http";
import { SocketService } from "./infra/socket/SocketService";

const PORT = envConfig.port;
const MONGO_URI = envConfig.mongoUri;

const startServer = async () => {
    await connectDatabase(MONGO_URI);

    const httpServer = http.createServer(app);
    const socketService = new SocketService(httpServer);
    socketService.initialize();

    httpServer.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();
