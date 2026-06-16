import express from "express";
import { ApiResponse } from "./interfaces/http/helpers/implementation/apiResponse";
import { authRouter } from "./interfaces/routes/auth.routes";
import { adminRouter } from "./interfaces/routes/admin.routes";
import { userRoutes } from "./interfaces/routes/UserRoutes";
import workspaceRoutes from "./interfaces/routes/workspace.routes";
import channelRoutes from "./interfaces/routes/channel.routes";
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

app.get("/", (req, res) => {
    const responsePayload = ApiResponse.success(SuccessMessage.API_RUNNING);
    res.status(200).json(responsePayload);
});

app.use(errorHandler);

export default app;
