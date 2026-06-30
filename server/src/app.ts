import express from "express";
import { ApiResponse } from "./interfaces/http/helpers/implementation/apiResponse";
import { authRouter } from "./interfaces/routes/auth.routes";
import { adminRouter } from "./interfaces/routes/admin.routes";
import { userRoutes } from "./interfaces/routes/user.routes";
import workspaceRoutes from "./interfaces/routes/workspace.routes";
import channelRoutes from "./interfaces/routes/channel.routes";
import dmRoutes from "./interfaces/routes/dm.routes";
import pollRoutes from "./interfaces/routes/poll.routes";
import uploadRoutes from "./interfaces/routes/upload.routes";
import notificationRoutes from "./interfaces/routes/notification.routes";
import aiRoutes from "./interfaces/routes/ai.routes";
import { errorHandler } from "./interfaces/middlewares/errorHandler";
import { SuccessMessage } from "./domain/enums/SuccessMessage";
import { envConfig } from "./infra/config/envConfig";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: [envConfig.clientUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces", channelRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", dmRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    const responsePayload = ApiResponse.success(SuccessMessage.API_RUNNING);
    res.status(200).json(responsePayload);
});

app.use(errorHandler);

export default app;
