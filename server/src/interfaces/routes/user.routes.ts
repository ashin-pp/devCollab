import { Router } from "express";
import { userController } from "../../container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

// Apply authMiddleware to all user routes
router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.post("/change-password", userController.changePassword);
router.post("/change-email/request", userController.requestEmailChange);
router.post("/change-email/verify", userController.verifyEmailChange);

router.post("/profile/image", upload.single('profileImage'), userController.uploadProfileImage);
router.delete("/profile/image", userController.deleteProfileImage);

router.get("/search", userController.searchByEmail);

export const userRoutes = router;
