import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads/products");
const avatarsDir = path.join(__dirname, "../uploads/avatars");

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(avatarsDir, { recursive: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const avatarDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const rawUploadProduct = multer({
  storage: productDiskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
}).array("images", 6);

const rawUploadAvatar = multer({
  storage: avatarDiskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single("avatar");

export const uploadProduct = (req, res, next) => {
  rawUploadProduct(req, res, async (err) => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0) return next();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Try Cloudinary upload, fallback to local URL if Cloudinary fails
    for (const file of req.files) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "aftergoodhours/products",
          transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
        });
        file.path = uploadResult.secure_url;
        // Clean up local temp file
        try { fs.unlinkSync(file.path); } catch {}
      } catch (cloudErr) {
        // Fallback to serving via local server
        file.path = `${baseUrl}/uploads/products/${file.filename}`;
      }
    }
    next();
  });
};

export const uploadAvatar = (req, res, next) => {
  rawUploadAvatar(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "aftergoodhours/avatars",
        transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }],
      });
      req.file.path = uploadResult.secure_url;
      try { fs.unlinkSync(req.file.path); } catch {}
    } catch (cloudErr) {
      req.file.path = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    }
    next();
  });
};

export { cloudinary };
