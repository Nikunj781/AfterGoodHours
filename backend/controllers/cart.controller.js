import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      populate: { path: "seller", select: "name avatar" },
    });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "Product ID required." });

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found or unavailable." });
    }
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot add your own product to cart." });
    }
    if (product.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.quantity} item(s) available.` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (newQty > product.quantity) {
        return res.status(400).json({ success: false, message: `Only ${product.quantity} item(s) available.` });
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity), priceAtAdd: product.price });
    }

    await cart.save();
    await cart.populate({ path: "items.product", populate: { path: "seller", select: "name avatar" } });
    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/cart/update
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Product ID and quantity required." });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not in cart." });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (product && Number(quantity) > product.quantity) {
        return res.status(400).json({ success: false, message: `Only ${product.quantity} item(s) available.` });
      }
      item.quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate({ path: "items.product", populate: { path: "seller", select: "name avatar" } });
    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/remove/:productId
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate({ path: "items.product", populate: { path: "seller", select: "name avatar" } });
    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) { cart.items = []; await cart.save(); }
    res.status(200).json({ success: true, message: "Cart cleared." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

