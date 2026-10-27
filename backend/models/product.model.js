import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    category: {
      type: String,
      required: true,
      enum: [
        "beverages",
        "snacks",
        "fruits",
        "instant-food",
        "stationery",
        "medicines",
        "electronics",
        "miscellaneous",
      ],
    },
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

export default mongoose.model("Product", productSchema);

