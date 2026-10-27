import express from "express";
import { register, login, logout, getMe, updateProfile, toggleServiceStatus } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../utils/cloudinary.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, uploadAvatar, updateProfile);
router.put("/service-toggle", protect, toggleServiceStatus);

export default router;

