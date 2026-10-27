import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";

dotenv.config();

const SEED_PRODUCTS = [
  {
    title: "Maggi 2-Minute Masala Noodles (4-Pack)",
    description: "Unopened 4-pack of classic Maggi masala noodles. Perfect for late night study sessions or quick hostel hunger! Ready for pickup.",
    price: 55,
    quantity: 12,
    category: "instant-food",
    images: [
      "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Chilled Red Bull Energy Drink (250ml)",
    description: "Ice cold can stored in mini-fridge. Gives you wings during semester exam nights! Grab it chilled right now.",
    price: 115,
    quantity: 8,
    category: "beverages",
    images: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Lay's Spanish Tomato Tango & Cream Onion Combo",
    description: "Two party size packs of Lay's crisps. Sealed and crunchy. Great snack companion for gaming or binge-watching.",
    price: 40,
    quantity: 10,
    category: "snacks",
    images: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Nescafé Cold Coffee Chilled Drink",
    description: "Creamy and rich ready-to-drink cold coffee. Kept cold in hostel fridge. Beat the heat & morning fatigue.",
    price: 45,
    quantity: 14,
    category: "beverages",
    images: [
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Fresh Shimla Sweet Apples (Pack of 4)",
    description: "Crisp and juicy sweet apples bought fresh today from local fruit market. High fiber healthy hostel snack.",
    price: 60,
    quantity: 6,
    category: "fruits",
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Classmate Spiral Notebook (300 Pages, Ruled)",
    description: "High quality smooth ruled paper spiral binding notebook. Unused, bought extra bundle at campus stationery.",
    price: 85,
    quantity: 5,
    category: "stationery",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "boAt 65W Braided Fast Type-C Cable (1.5m)",
    description: "Heavy duty nylon braided fast charging Type-C cable. Compatible with OnePlus, Samsung, Xiaomi, and laptops.",
    price: 179,
    quantity: 4,
    category: "electronics",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Paracetamol 650mg + Vicks Inhaler Relief Pack",
    description: "Emergency medical strip of Paracetamol 650 + sealed Vicks nose inhaler for cold and fever relief in dorm.",
    price: 50,
    quantity: 8,
    category: "medicines",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Knorr Hot & Sour Chicken/Veg Cup Soup (3-Pack)",
    description: "Warm soothing soup for chilly hostel evenings. Just pour boiling water from electric kettle and stir!",
    price: 70,
    quantity: 9,
    category: "instant-food",
    images: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Cadbury Dairy Milk Silk Chocolate (150g)",
    description: "Original Dairy Milk Silk, stored cool in hostel fridge so not melted. Perfect midnight sweet tooth fix.",
    price: 80,
    quantity: 7,
    category: "snacks",
    images: [
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Clip-on Dorm LED Desk Lamp (3 Color Modes)",
    description: "USB rechargeable clip light for bunk bed frame. Lets you read all night without disturbing your roommates.",
    price: 220,
    quantity: 3,
    category: "miscellaneous",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Fresh Ripe Cavendish Bananas (6 Pcs)",
    description: "Fresh bunch of bananas bought from market. Great instant energy boost for gym or pre-exam breakfast.",
    price: 35,
    quantity: 5,
    category: "fruits",
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80",
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Find or create student seller
    let seller = await User.findOne({ email: "seller@hostel.edu" });
    if (!seller) {
      seller = await User.create({
        name: "Rahul Sharma (Hostel Store)",
        email: "seller@hostel.edu",
        password: "password123",
        roomNumber: "214",
        block: "B Block",
        hostelName: "Tagore Bhawan",
        rating: 4.9,
        totalReviews: 24,
      });
      console.log("Created student seller:", seller.name);
    }

    // Clear existing products to ensure clean slate with high quality images
    await Product.deleteMany({});
    console.log("Cleared old product listings.");

    // Insert new products
    const productsToInsert = SEED_PRODUCTS.map((p) => ({
      ...p,
      seller: seller._id,
      isActive: true,
      totalSold: Math.floor(Math.random() * 8),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }));

    await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${productsToInsert.length} hostel products with images! 🎉`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
