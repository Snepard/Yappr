import express from "express";
import { checkAuth, login, logout, signup, updateProfile, forgotPassword, resetPassword, updatePublicKey, updateE2EEKeys, changePassword, recordPinAttempt } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/public-key", protectRoute, updatePublicKey);
router.put("/e2ee-keys", protectRoute, updateE2EEKeys);
router.put("/change-password", protectRoute, changePassword);
router.post("/pin-attempt", protectRoute, recordPinAttempt);

router.get("/check", protectRoute, checkAuth);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;