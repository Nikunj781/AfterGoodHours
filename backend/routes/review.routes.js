import express from "express";
import { createReview, getSellerReviews } from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/seller/:sellerId", getSellerReviews);

export default router;

