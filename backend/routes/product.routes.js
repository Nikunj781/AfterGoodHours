import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadProduct } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/seller/my", protect, getMyProducts);
router.get("/:id", getProduct);
router.post("/", protect, uploadProduct, createProduct);
router.put("/:id", protect, uploadProduct, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;

