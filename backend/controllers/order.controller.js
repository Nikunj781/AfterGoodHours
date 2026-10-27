import crypto from "crypto";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import razorpay from "../utils/razorpay.js";
import { notifyUser } from "../socket.js";

let _io = null;
export const setIo = (io) => { _io = io; };

// POST /api/orders/create-razorpay-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Validate all items still available
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive || product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product?.title || "A product"}" is no longer available in the requested quantity.`,
        });
      }
      if (product.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: "Cannot buy your own product." });
      }
    }

    const totalAmount = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    res.status(200).json({ success: true, order: rzpOrder, totalAmount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders/verify-payment
export const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Group items by seller
    const sellerMap = {};
    for (const item of cart.items) {
      const product = item.product;
      const sellerId = product.seller.toString();
      if (!sellerMap[sellerId]) sellerMap[sellerId] = [];
      sellerMap[sellerId].push(item);
    }

    const createdOrders = [];

    for (const [sellerId, items] of Object.entries(sellerMap)) {
      const seller = await User.findById(sellerId);
      const orderItems = items.map((i) => ({
        product: i.product._id,
        title: i.product.title,
        price: i.priceAtAdd,
        quantity: i.quantity,
        image: i.product.images?.[0] || "",
      }));
      const totalAmount = items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0);

      const order = await Order.create({
        buyer: req.user._id,
        seller: sellerId,
        items: orderItems,
        totalAmount,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: "paid",
        sellerRoom: seller?.roomNumber || "N/A",
        sellerBlock: seller?.block || "",
        sellerHostel: seller?.hostelName || "",
      });

      // Decrement product quantities
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { quantity: -item.quantity, totalSold: item.quantity },
        });
        // Check if sold out
        const updated = await Product.findById(item.product._id);
        if (updated && updated.quantity <= 0) {
          updated.isActive = false;
          await updated.save();
        }
      }

      // Update seller stats
      await User.findByIdAndUpdate(sellerId, { $inc: { totalSales: totalAmount } });

      // Notify seller via socket
      if (_io) {
        notifyUser(_io, sellerId, "new_order", {
          message: `New order from ${req.user.name}!`,
          order: { _id: order._id, totalAmount, items: orderItems, buyerName: req.user.name },
        });
      }

      createdOrders.push(order);
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, orders: createdOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders/cod-checkout — Pay on Pickup
export const createCODOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Validate all items still available
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive || product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product?.title || "A product"}" is no longer available in the requested quantity.`,
        });
      }
      if (product.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: "Cannot buy your own product." });
      }
    }

    // Group items by seller
    const sellerMap = {};
    for (const item of cart.items) {
      const product = item.product;
      const sellerId = product.seller.toString();
      if (!sellerMap[sellerId]) sellerMap[sellerId] = [];
      sellerMap[sellerId].push(item);
    }

    const createdOrders = [];

    for (const [sellerId, items] of Object.entries(sellerMap)) {
      const seller = await User.findById(sellerId);
      const orderItems = items.map((i) => ({
        product: i.product._id,
        title: i.product.title,
        price: i.priceAtAdd,
        quantity: i.quantity,
        image: i.product.images?.[0] || "",
      }));
      const totalAmount = items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0);

      const order = await Order.create({
        buyer: req.user._id,
        seller: sellerId,
        items: orderItems,
        totalAmount,
        razorpayOrderId: `pickup_${Date.now()}`,
        status: "paid",
        sellerRoom: seller?.roomNumber || "N/A",
        sellerBlock: seller?.block || "",
        sellerHostel: seller?.hostelName || "",
      });

      // Decrement product quantities
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { quantity: -item.quantity, totalSold: item.quantity },
        });
        const updated = await Product.findById(item.product._id);
        if (updated && updated.quantity <= 0) {
          updated.isActive = false;
          await updated.save();
        }
      }

      // Update seller stats
      await User.findByIdAndUpdate(sellerId, { $inc: { totalSales: totalAmount } });

      // Notify seller via socket
      if (_io) {
        notifyUser(_io, sellerId, "new_order", {
          message: `New Pay-on-Pickup order from ${req.user.name}!`,
          order: { _id: order._id, totalAmount, items: orderItems, buyerName: req.user.name },
        });
      }

      createdOrders.push(order);
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, orders: createdOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/buyer  — buyer's order history
export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("seller", "name avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/seller  — seller's incoming orders
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("buyer", "name avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name avatar email")
      .populate("seller", "name avatar");

    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    const userId = req.user._id.toString();
    if (order.buyer._id.toString() !== userId && order.seller._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // Only reveal room number if buyer and payment done
    const orderObj = order.toObject();
    if (order.buyer._id.toString() !== userId || order.status === "pending_payment") {
      delete orderObj.sellerRoom;
      delete orderObj.sellerBlock;
      delete orderObj.sellerHostel;
    }

    res.status(200).json({ success: true, order: orderObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status  — seller updates status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["ready_for_pickup", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    if (order.status === "pending_payment") {
      return res.status(400).json({ success: false, message: "Order not yet paid." });
    }

    order.status = status;
    await order.save();

    // Notify buyer
    if (_io) {
      notifyUser(_io, order.buyer.toString(), "order_status_update", {
        message: status === "ready_for_pickup" ? "Your order is ready for pickup! 🎉" : "Order completed!",
        orderId: order._id,
        status,
      });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

