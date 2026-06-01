import express from "express";
import { ApiResponse } from "./interfaces/http/helpers/implementation/apiResponse";
import { authRouter } from "./interfaces/routes/auth.routes";
import { adminRouter } from "./interfaces/routes/admin.routes";
import { errorHandler } from "./interfaces/middlewares/errorHandler";
import { SuccessMessage } from "./domain/enums/SuccessMessage";

const app = express();
app.use(express.json());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
    const responsePayload = ApiResponse.success(SuccessMessage.API_RUNNING);
    res.status(200).json(responsePayload);
});

// Global Error Handler must be the LAST middleware
app.use(errorHandler);

export default app;
