import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: "Order ID and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the buyer can review." });
    }
    if (order.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only review completed orders." });
    }

    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(409).json({ success: false, message: "Already reviewed this order." });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: order.seller,
      order: orderId,
      rating: Number(rating),
      comment,
    });

    // Update seller's rating
    const allReviews = await Review.find({ reviewee: order.seller });
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(order.seller, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "Already reviewed this order." });
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/seller/:sellerId
export const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.sellerId })
      .populate("reviewer", "name avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

