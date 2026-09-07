import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createSession,
  joinSession,
  inviteFriends,
  leaveSession,
  endSession,
  getSession,
} from "../controllers/yap.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/create", createSession);
router.post("/join", joinSession);
router.post("/invite", inviteFriends);
router.post("/leave", leaveSession);
router.post("/end", endSession);
router.get("/:sessionId", getSession);

export default router;
