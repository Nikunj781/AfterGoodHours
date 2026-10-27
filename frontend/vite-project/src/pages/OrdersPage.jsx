import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import Spinner from "../components/ui/Spinner";
import { Package, MapPin, Clock, Copy, Star, CheckCircle, MessageSquare, ShoppingBag, X } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_BADGES = {
  paid: { label: "Payment Confirmed ⚡", className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40" },
  ready_for_pickup: { label: "Ready for Pickup! 🏃", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(0,255,136,0.4)] animate-pulse" },
  completed: { label: "Completed ✨", className: "bg-white/10 text-stone-300 border-white/20" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-300 border-red-500/30" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/orders/buyer")
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const copyRoom = (room) => {
    navigator.clipboard.writeText(room);
    toast.success(`Copied Room ${room} to clipboard! 📋`, {
      style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        orderId: reviewOrder._id,
        rating,
        comment,
      });
      toast.success("Review submitted! ⭐ Thank you for rating your hostel mate.", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
      setReviewOrder(null);
      setComment("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Package className="h-7 w-7 text-emerald-400 neon-text-green" /> My Hostel Orders
          </h1>
          <p className="text-xs text-stone-400 mt-1">Track payments and room pickup directions</p>
        </div>
        <Link to="/" className="btn-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4 text-emerald-400" /> Browse More
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 card p-8 border border-white/10 space-y-3">
          <p className="text-6xl mb-2">📦</p>
          <h3 className="text-xl font-bold text-white">No orders yet</h3>
          <p className="text-stone-400 text-sm max-w-sm mx-auto">
            Explore late night snacks and hostel essentials right from your neighbours!
          </p>
          <button onClick={() => navigate("/")} className="btn-primary mt-2">
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = STATUS_BADGES[order.status] || STATUS_BADGES.paid;
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={order._id} className="card p-5 bg-[#0b0c14] border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-400">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3 text-cyan-400" /> {dateStr}
                    </p>
                  </div>
                  <span className={`badge border text-xs py-1 px-3 ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Items Purchased */}
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-[#050508] overflow-hidden flex-shrink-0 border border-white/10">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.title}</p>
                        <p className="text-xs text-stone-400 font-mono">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <span className="font-extrabold text-sm text-emerald-400 neon-text-green">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Revealed Hostel Pickup Box */}
                <div className="bg-[#050508] rounded-2xl p-4 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pickup Destination</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-extrabold text-white">
                        Room <span className="text-emerald-400 text-lg">{order.sellerRoom || "N/A"}</span>
                        {order.sellerBlock ? ` · Block ${order.sellerBlock}` : ""}
                        {order.sellerHostel ? ` · ${order.sellerHostel}` : ""}
                      </p>
                      {order.sellerRoom && (
                        <button
                          type="button"
                          onClick={() => copyRoom(order.sellerRoom)}
                          className="p-1 hover:text-emerald-400 text-stone-400 transition-colors"
                          title="Copy room number"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">
                      Seller: <strong className="text-stone-200">{order.seller?.name || "Hostel Resident"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    <span className="text-xs text-stone-400">Amount Paid</span>
                    <span className="text-xl font-black text-white neon-text-green">₹{order.totalAmount}</span>

                    {order.status === "completed" && (
                      <button
                        onClick={() => setReviewOrder(order)}
                        className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                      >
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Rate Seller
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card max-w-md w-full p-6 bg-[#0c0d18] border border-emerald-500/40 shadow-[0_0_50px_rgba(0,255,136,0.25)] space-y-4 fade-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> Rate Seller Experience
              </h3>
              <button onClick={() => setReviewOrder(null)} className="text-stone-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className={`text-2xl transition-transform hover:scale-125 ${
                        s <= rating ? "text-amber-400" : "text-stone-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">Comment (Optional)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Fast pickup, friendly neighbour, fresh snacks..."
                  className="input text-sm resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setReviewOrder(null)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="btn-primary text-xs py-2 px-4">
                  {submittingReview ? <Spinner size="sm" /> : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
