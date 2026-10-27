import express from "express";
import {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  createCODOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify-payment", verifyPaymentAndCreateOrder);
router.post("/cod-checkout", createCODOrder);
router.get("/buyer", getBuyerOrders);
router.get("/seller", getSellerOrders);
router.get("/:id", getOrder);
router.put("/:id/status", updateOrderStatus);

export default router;

