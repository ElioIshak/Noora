// Auth route registration.
import { Router } from "express";

import {
  forgotPasswordController,
  loginController,
  logoutController,
  resetPasswordController,
  signupController
} from "../controllers/user.controller";
import { requireAuth, verifyJWT } from "../middleware/auth";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/logout", verifyJWT, requireAuth, logoutController);

export default router;
