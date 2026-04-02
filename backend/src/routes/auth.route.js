import express from "express";
import { checkAuth, login, logout, signup, updateProfile, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;