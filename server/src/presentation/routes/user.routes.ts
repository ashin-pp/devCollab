import { Router } from "express";
import { userController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";
import { validate } from "../middlewares/validate.middleware";
import {
    changePasswordBodySchema,
    requestEmailChangeBodySchema,
    searchByEmailQuerySchema,
    selectPlanBodySchema,
    updateProfileBodySchema,
    verifyEmailChangeBodySchema,
} from "../validators/user.schema";

const router = Router();

router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put(
    "/profile",
    validate({ body: updateProfileBodySchema }),
    userController.updateProfile
);
router.put("/plan", validate({ body: selectPlanBodySchema }), userController.selectPlan);
router.post(
    "/change-password",
    validate({ body: changePasswordBodySchema }),
    userController.changePassword
);
router.post(
    "/change-email/request",
    validate({ body: requestEmailChangeBodySchema }),
    userController.requestEmailChange
);
router.post(
    "/change-email/verify",
    validate({ body: verifyEmailChangeBodySchema }),
    userController.verifyEmailChange
);
router.post("/profile/image", upload.single("profileImage"), userController.uploadProfileImage);
router.delete("/profile/image", userController.deleteProfileImage);
router.get(
    "/search",
    validate({ query: searchByEmailQuerySchema }),
    userController.searchByEmail
);

export const userRoutes = router;
