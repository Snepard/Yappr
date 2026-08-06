import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getRecommendedFriends,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/recommendations", protectRoute, getRecommendedFriends);
router.post("/request/:id", protectRoute, sendFriendRequest);
router.get("/requests", protectRoute, getFriendRequests);
router.put("/request/:id/accept", protectRoute, acceptFriendRequest);
router.put("/request/:id/decline", protectRoute, declineFriendRequest);

export default router;
