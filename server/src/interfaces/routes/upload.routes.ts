import { Router } from "express";
import { uploadController } from "../../container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/image", upload.single('image'), uploadController.uploadChatImage);

export default router;
