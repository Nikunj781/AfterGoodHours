import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "../store/slices/productSlice";
import { addToCart } from "../store/slices/cartSlice";
import { toggleWishlist } from "../store/slices/wishlistSlice";
import Spinner from "../components/ui/Spinner";
import StarRating from "../components/ui/StarRating";
import { ShoppingCart, Store, ChevronLeft, ChevronRight, Heart, MapPin, ShieldCheck, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/axios";

const CATEGORY_EMOJI = {
  beverages: "🥤", snacks: "🍿", fruits: "🍎", "instant-food": "🍜",
  stationery: "📚", medicines: "💊", electronics: "🔌", miscellaneous: "🛍️"
};

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const wishlist = useSelector((s) => s.wishlist?.items || []);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    setQty(1);
    setImgIdx(0);
  }, [id, dispatch]);

  useEffect(() => {
    if (product?.seller?._id) {
      api.get(`/reviews/seller/${product.seller._id}`).then((r) => setReviews(r.data.reviews || [])).catch(() => {});
    }
  }, [product?.seller?._id]);

  const isOwn = user && product?.seller?._id === user._id;
  const isWishlisted = product ? wishlist.some((p) => p._id === product._id) : false;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    const result = await dispatch(addToCart({ productId: product._id, quantity: qty }));
    setAddingToCart(false);
    if (addToCart.fulfilled.match(result)) {
      toast.success("Added to cart! 🛒", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
      navigate("/cart");
    } else {
      toast.error(result.payload || "Failed to add to cart");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied! 🔗", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">🔍</p>
        <p className="text-white font-bold">Product not found</p>
        <button onClick={() => navigate("/")} className="btn-secondary text-sm">
          Return to Marketplace
        </button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleWishlist(product))}
            className="p-2 rounded-xl bg-[#0b0c14] border border-white/10 hover:border-pink-500/50 text-stone-300 transition-colors"
            title="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-pink-500 text-pink-500" : ""}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#0b0c14] border border-white/10 hover:border-cyan-400 text-stone-300 transition-colors"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images Display */}
        <div className="space-y-3">
          <div className="aspect-square bg-[#050508] rounded-3xl overflow-hidden relative border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            {images.length > 0 ? (
              <>
                <img
                  src={images[imgIdx]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80";
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-2 border border-white/20 backdrop-blur-md"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-2 border border-white/20 backdrop-blur-md"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {CATEGORY_EMOJI[product.category] || "📦"}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    i === imgIdx
                      ? "border-emerald-400 shadow-[0_0_12px_rgba(0,255,136,0.5)]"
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Panel */}
        <div className="flex flex-col gap-5">
          <div>
            <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 mb-3 text-xs">
              {CATEGORY_EMOJI[product.category]} {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl md:text-4xl font-black text-emerald-400 neon-text-green">
                ₹{product.price}
              </span>
              <span className="text-xs font-mono text-stone-400">
                {product.quantity > 0 ? `⚡ ${product.quantity} units available in hostel` : "Out of stock"}
              </span>
            </div>
          </div>

          <div className="card p-4 bg-[#0b0c14] border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">Description & Pickup Info</h4>
            <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Seller Profile Card */}
          <div className="card p-4 flex items-center gap-3.5 border border-emerald-500/30 bg-[#0b0c14]/90 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            {product.seller?.avatar ? (
              <img
                src={product.seller.avatar}
                alt={product.seller.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-emerald-400"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-lg">
                {product.seller?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{product.seller?.name || "Hostel Resident"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={product.seller?.rating || 0} size="sm" />
                <span className="text-xs font-mono text-stone-400">({product.seller?.totalReviews || 0} reviews)</span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-cyan-400" />
                {product.seller?.hostelName || "Hostel Campus"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider block">🔒 Pickup Room</span>
              <span className="text-xs text-stone-300">Revealed on checkout</span>
            </div>
          </div>

          {/* Action Area */}
          {!isOwn && product.quantity > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Quantity:</span>
                <div className="flex items-center border border-white/15 rounded-xl bg-[#0d0e18]">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-1.5 hover:bg-white/10 rounded-l-xl text-white font-bold"
                  >
                    −
                  </button>
                  <span className="px-4 py-1.5 font-mono font-bold text-emerald-400 text-sm">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                    className="px-3.5 py-1.5 hover:bg-white/10 rounded-r-xl text-white font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-mono text-stone-400">= ₹{product.price * qty}</span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5 text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(0,255,136,0.4)]"
              >
                {addingToCart ? <Spinner size="sm" /> : <><ShoppingCart className="h-5 w-5" /> Add to Cart (₹{product.price * qty})</>}
              </button>
            </div>
          ) : isOwn ? (
            <button
              onClick={() => navigate("/seller")}
              className="btn-secondary w-full flex items-center gap-2 justify-center py-3 text-sm font-bold border-cyan-500/40 text-cyan-300"
            >
              <Store className="h-4 w-4" /> Manage in Seller Dashboard
            </button>
          ) : (
            <div className="card p-4 text-center text-stone-400 border border-white/10">
              😔 This item is currently out of stock
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> Seller Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-stone-400 text-sm">No reviews yet for this seller. Be the first to order and rate!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {reviews.map((r) => (
              <div key={r._id} className="card p-4 flex gap-3 bg-[#0b0c14] border border-white/10">
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {r.reviewer?.name?.[0]?.toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{r.reviewer?.name || "Student"}</p>
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                  {r.comment && <p className="text-xs text-stone-300">{r.comment}</p>}
                  <p className="text-[10px] text-stone-500 font-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
