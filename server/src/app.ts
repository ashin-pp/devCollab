import express from "express";
import { ApiResponse } from "./interfaces/http/helpers/implementation/apiResponse";

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    // 1. We create the formatted object using your screenshot's class
    const responsePayload = ApiResponse.success("DevCollab API is running!");
    
    // 2. We send it using express!
    res.status(200).json(responsePayload);
});

export default app;
