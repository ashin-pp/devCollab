import { Router } from "express";
import { userController } from "../../container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Apply authMiddleware to all user routes
router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.post("/change-password", userController.changePassword);

export const userRoutes = router;
