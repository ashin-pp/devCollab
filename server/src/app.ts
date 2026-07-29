import express from "express";
import { ApiResponse } from "./presentation/http/helpers/implementation/apiResponse";
import { authRouter } from "./presentation/routes/auth.routes";
import { adminRouter } from "./presentation/routes/admin.routes";
import { userRoutes } from "./presentation/routes/user.routes";
import workspaceRoutes from "./presentation/routes/workspace.routes";
import channelRoutes from "./presentation/routes/channel.routes";
import dmRoutes from "./presentation/routes/dm.routes";
import pollRoutes from "./presentation/routes/poll.routes";
import uploadRoutes from "./presentation/routes/upload.routes";
import notificationRoutes from "./presentation/routes/notification.routes";
import aiRoutes from "./presentation/routes/ai.routes";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { SuccessMessage } from "./domain/enums/SuccessMessage";
import { envConfig } from "./config/envConfig";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: [envConfig.clientUrl, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
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
