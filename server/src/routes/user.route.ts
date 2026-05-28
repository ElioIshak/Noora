// User route registration.
import { Router } from "express";

import {
  deleteMyAccountController,
  exportMyDataController,
  getMyNotificationsController,
  getMyProfileController,
  sendContactMessageController,
  updateMyNotificationsController,
  updateMyProfileController
} from "../controllers/user.controller";
import { requireAuth, verifyJWT } from "../middleware/auth";

const router = Router();

router.post("/contact", sendContactMessageController);
router.get("/user/profile", verifyJWT, requireAuth, getMyProfileController);
router.patch("/user/profile", verifyJWT, requireAuth, updateMyProfileController);
router.get("/user/notifications", verifyJWT, requireAuth, getMyNotificationsController);
router.patch("/user/notifications", verifyJWT, requireAuth, updateMyNotificationsController);
router.get("/user/export", verifyJWT, requireAuth, exportMyDataController);
router.delete("/user/account", verifyJWT, requireAuth, deleteMyAccountController);

export default router;
