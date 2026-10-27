import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../store/slices/cartSlice";
import { toggleWishlist } from "../store/slices/wishlistSlice";
import { ShoppingCart, Star, Heart } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORY_EMOJI = {
  beverages: "🥤", snacks: "🍿", fruits: "🍎", "instant-food": "🍜",
  stationery: "📚", medicines: "💊", electronics: "🔌", miscellaneous: "🛍️"
};

const CATEGORY_COLORS = {
  beverages: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
  snacks: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  fruits: "bg-green-500/15 text-green-300 border-green-500/40",
  "instant-food": "bg-amber-500/15 text-amber-300 border-amber-500/40",
  stationery: "bg-purple-500/15 text-purple-300 border-purple-500/40",
  medicines: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  electronics: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  miscellaneous: "bg-stone-500/15 text-stone-300 border-stone-500/40"
};

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const wishlist = useSelector((s) => s.wishlist?.items || []);
  const isWishlisted = wishlist.some((p) => p._id === product._id);
  const isOwn = user && product.seller?._id === user._id;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }
    const result = await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      toast.success("Added to cart! 🛒", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
    } else {
      toast.error(result.payload || "Failed to add to cart");
    }
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    if (!isWishlisted) {
      toast.success("Added to Wishlist! 💖", {
        style: { background: "#0c0d18", color: "#f43f5e", border: "1px solid #f43f5e40" }
      });
    } else {
      toast("Removed from Wishlist", { icon: "💔" });
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="card group cursor-pointer hover:border-emerald-400/50 hover:shadow-[0_0_24px_rgba(0,255,136,0.2)] transition-all duration-300 flex flex-col bg-[#0b0c14]/90"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square bg-[#050508] overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {CATEGORY_EMOJI[product.category] || "📦"}
          </div>
        )}

        {/* Category Badge */}
        <span className={`absolute top-2.5 left-2.5 badge border ${CATEGORY_COLORS[product.category] || "bg-stone-500/20 text-stone-300"}`}>
          {CATEGORY_EMOJI[product.category]} {product.category}
        </span>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-pink-500/50 hover:scale-110 transition-all z-10"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted
                ? "fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                : "text-stone-300 hover:text-pink-400"
            }`}
          />
        </button>

        {/* Low Stock Neon Tag */}
        {product.quantity <= 3 && product.quantity > 0 && (
          <span className="absolute bottom-2.5 left-2.5 badge bg-red-500/20 text-red-300 border border-red-500/40 text-[10px]">
            ⚡ Only {product.quantity} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-emerald-400 transition-colors">
          {product.title}
        </h3>

        <div className="flex items-baseline justify-between mt-auto">
          <p className="text-xl font-black text-emerald-400 neon-text-green">
            ₹{product.price}
          </p>
          <span className="text-[11px] text-stone-400 font-mono">
            {product.quantity > 0 ? `${product.quantity} in room` : "Sold out"}
          </span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
          {product.seller?.avatar ? (
            <img src={product.seller.avatar} alt={product.seller.name} className="h-6 w-6 rounded-full object-cover border border-emerald-400/50" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
              {product.seller?.name?.[0]?.toUpperCase() || "H"}
            </div>
          )}
          <span className="text-xs text-stone-300 flex-1 truncate">{product.seller?.name || "Hostel Resident"}</span>
          {product.seller?.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-stone-300">{product.seller.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {isOwn ? (
          <span className="badge bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 self-start mt-1">
            Your listing
          </span>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className="btn-primary w-full mt-1.5 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.quantity === 0 ? "Sold Out" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}
