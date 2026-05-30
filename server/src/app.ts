import express from "express";
import { ApiResponse } from "./interfaces/http/helpers/implementation/apiResponse";
import { authRouter } from "./interfaces/routes/auth.routes";
import { errorHandler } from "./interfaces/middlewares/errorHandler";

const app = express();
app.use(express.json());

// API Routes
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
    const responsePayload = ApiResponse.success("DevCollab API is running!");
    res.status(200).json(responsePayload);
});

// Global Error Handler must be the LAST middleware
app.use(errorHandler);

export default app;
