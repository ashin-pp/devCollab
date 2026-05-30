import express from "express";
import { ApiResponse } from "./interfaces/http/helpers/implementation/apiResponse";

const app = express()
app.use(express.json())

app.get("/", (req, res) => {

    const responsePayload = ApiResponse.success("DevCollab API is running!")
    res.status(200).json(responsePayload)
});

export default app;
