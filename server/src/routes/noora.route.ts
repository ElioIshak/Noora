// Noora route registration.
import { Router } from "express";

import {
  chatController,
  createConversationController,
  deleteAllConversationsController,
  deleteConversationController,
  getMessagesController,
  getUserConversationsController
} from "../controllers/noora.controller";
import { requireAuth, verifyJWT } from "../middleware/auth";

const router = Router();

router.use(verifyJWT, requireAuth);

router.post("/conversation", createConversationController);
router.post("/chat", chatController);
router.get("/conversations", getUserConversationsController);
router.delete("/conversations", deleteAllConversationsController);
router.get("/conversation/:id", getMessagesController);
router.delete("/conversation/:id", deleteConversationController);

export default router;
