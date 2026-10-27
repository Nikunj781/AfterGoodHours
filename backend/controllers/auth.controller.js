import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, roomNumber, block, hostelName } = req.body;

    if (!name || !email || !password || !roomNumber) {
      return res.status(400).json({ success: false, message: "Name, email, password and room number are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({ name, email, password, roomNumber, block: block || "", hostelName: hostelName || "" });
    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);
    res.status(201).json({ success: true, user: user.toPublicJSON(), token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);
    res.status(200).json({ success: true, user: user.toPublicJSON(), token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, block, hostelName, roomNumber, phone, isServiceActive } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (block !== undefined) updateData.block = block;
    if (hostelName !== undefined) updateData.hostelName = hostelName;
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (phone !== undefined) updateData.phone = phone;
    if (isServiceActive !== undefined) updateData.isServiceActive = isServiceActive === "true" || isServiceActive === true;
    if (req.file) updateData.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/service-toggle  — toggle seller availability (ON / OFF)
export const toggleServiceStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    user.isServiceActive = !user.isServiceActive;
    await user.save();
    res.status(200).json({
      success: true,
      isServiceActive: user.isServiceActive,
      user: user.toPublicJSON(),
      message: user.isServiceActive ? "Service is now ONLINE (Accepting Orders) 🟢" : "Service is now OFFLINE (Orders Paused) 🔴"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

