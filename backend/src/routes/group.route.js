import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  updateGroupInfo,
  updateGroupPermissions,
  addMembers,
  removeMember,
  toggleAdminRole,
  timeoutMember,
  removeTimeout,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createGroup);
router.get("/", getUserGroups);
router.get("/:groupId", getGroupDetails);
router.put("/:groupId/info", updateGroupInfo);
router.put("/:groupId/permissions", updateGroupPermissions);
router.post("/:groupId/members", addMembers);
router.delete("/:groupId/members/:userId", removeMember);
router.put("/:groupId/admins/:userId", toggleAdminRole);
router.post("/:groupId/timeout/:userId", timeoutMember);
router.delete("/:groupId/timeout/:userId", removeTimeout);
router.post("/:groupId/leave", leaveGroup);

export default router;
