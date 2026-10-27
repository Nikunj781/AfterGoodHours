import Product from "../models/product.model.js";

export const DEFAULT_CATEGORY_IMAGES = {
  beverages: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80",
  snacks: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80",
  fruits: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
  "instant-food": "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80",
  stationery: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  medicines: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
  electronics: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
  miscellaneous: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
};

// GET /api/products  — browse with search, filter, sort, pagination
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      isActive: true,
      quantity: { $gt: 0 },
      $and: [
        {
          $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: { $exists: false } },
            { expiresAt: null },
          ],
        },
      ],
    };

    if (search) {
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortObj = { [sort]: order === "asc" ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("seller", "name avatar rating totalReviews hostelName roomNumber isServiceActive phone block")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name avatar rating totalReviews hostelName roomNumber isServiceActive phone block"
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products  (requires auth + image upload middleware)
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, quantity, category } = req.body;
    if (!title || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "Title, description, price and category are required." });
    }

    const images = [];

    // 1. Files uploaded from form
    if (req.files && req.files.length > 0) {
      images.push(...req.files.map((f) => f.path || f.url));
    }

    // 2. Extra image URLs or preset photo URLs provided
    const rawUrls = req.body.imageUrls || req.body.images;
    if (rawUrls) {
      if (Array.isArray(rawUrls)) {
        images.push(...rawUrls.filter(Boolean));
      } else if (typeof rawUrls === "string") {
        try {
          const parsed = JSON.parse(rawUrls);
          if (Array.isArray(parsed)) images.push(...parsed.filter(Boolean));
          else if (parsed) images.push(parsed);
        } catch {
          if (rawUrls.trim()) images.push(rawUrls.trim());
        }
      }
    }

    // 3. Fallback default category image if none provided
    if (images.length === 0) {
      images.push(DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES.snacks);
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      quantity: Number(quantity) || 1,
      category,
      images,
      seller: req.user._id,
    });

    const populated = await product.populate("seller", "name avatar rating totalReviews hostelName roomNumber isServiceActive phone block");
    res.status(201).json({ success: true, product: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const { title, description, price, quantity, category, isActive } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (category) product.category = category;
    if (isActive !== undefined) product.isActive = isActive === "true" || isActive === true;

    const newImages = [];
    if (req.files && req.files.length > 0) {
      newImages.push(...req.files.map((f) => f.path || f.url));
    }
    const rawUrls = req.body.imageUrls || req.body.images;
    if (rawUrls) {
      if (Array.isArray(rawUrls)) {
        newImages.push(...rawUrls.filter(Boolean));
      } else if (typeof rawUrls === "string") {
        try {
          const parsed = JSON.parse(rawUrls);
          if (Array.isArray(parsed)) newImages.push(...parsed.filter(Boolean));
          else if (parsed) newImages.push(parsed);
        } catch {
          if (rawUrls.trim()) newImages.push(rawUrls.trim());
        }
      }
    }

    if (newImages.length > 0) {
      product.images = newImages;
    }

    await product.save();
    const populated = await product.populate("seller", "name avatar rating totalReviews hostelName roomNumber isServiceActive phone block");
    res.status(200).json({ success: true, product: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/seller/my  — seller's own listings
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
