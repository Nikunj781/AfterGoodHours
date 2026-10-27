import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title: String,
  price: Number,
  quantity: Number,
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "ready_for_pickup", "completed", "cancelled"],
      default: "pending_payment",
    },
    // Room number only revealed after payment
    sellerRoom: { type: String },
    sellerBlock: { type: String },
    sellerHostel: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

