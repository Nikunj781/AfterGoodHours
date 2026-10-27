import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateCartItem, removeFromCart, clearCart } from "../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";
import api from "../utils/axios";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [paying, setPaying] = useState(false);
  const [codLoading, setCodLoading] = useState(false);

  const total = items.reduce((sum, i) => sum + (i.priceAtAdd || i.product?.price || 0) * i.quantity, 0);

  const handleRazorpayCheckout = async () => {
    const ok = await loadRazorpay();
    if (!ok) {
      toast.error("Failed to load payment gateway");
      return;
    }
    setPaying(true);
    try {
      const { data } = await api.post("/orders/create-razorpay-order");
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Tstd6lBE00u2jI",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "AfterGoodHours",
        description: "Hostel Marketplace Payment",
        order_id: data.order.id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#00ff88" },
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/orders/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            const orderIds = verifyRes.data.orders.map((o) => o._id).join(",");
            toast.success("Payment successful! 🎉", {
              style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" },
            });
            navigate(`/checkout/success?orders=${orderIds}`);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast("Payment cancelled");
          },
        },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not initiate payment");
      setPaying(false);
    }
  };

  const handleCODCheckout = async () => {
    setCodLoading(true);
    try {
      const { data } = await api.post("/orders/cod-checkout");
      const orderIds = data.orders.map((o) => o._id).join(",");
      toast.success("Order confirmed! Pay on pickup at seller's room. 🤝", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" },
      });
      navigate(`/checkout/success?orders=${orderIds}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setCodLoading(false);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ShoppingCart className="h-7 w-7 text-emerald-400 neon-text-green" /> Your Cart
          </h1>
          <p className="text-xs text-stone-400 mt-1">Hostel roommate pickup — no delivery fees</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => dispatch(clearCart())}
            className="text-xs font-semibold text-stone-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 card p-8 border border-white/10 space-y-4">
          <p className="text-6xl mb-2">🛒</p>
          <h3 className="text-xl font-bold text-white">Your cart is empty</h3>
          <p className="text-stone-400 text-sm max-w-sm mx-auto">
            Browse midnight snacks, instant noodles, chilled energy drinks, and study essentials!
          </p>
          <button onClick={() => navigate("/")} className="btn-primary mt-2">
            Browse Hostel Items
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const img = product.images?.[0];
              const price = item.priceAtAdd || product.price || 0;

              return (
                <div key={product._id} className="card p-4 flex gap-4 items-center bg-[#0b0c14] border border-white/10 hover:border-emerald-500/30">
                  <div className="w-20 h-20 bg-[#050508] rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    {img ? (
                      <img src={img} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{product.title}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">Seller: {product.seller?.name || "Hostel Resident"}</p>
                    <p className="text-emerald-400 font-extrabold text-base mt-1 neon-text-green">₹{price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-white/15 rounded-lg bg-[#0d0e18]">
                        <button
                          onClick={() => dispatch(updateCartItem({ productId: product._id, quantity: item.quantity - 1 }))}
                          className="px-2.5 py-0.5 hover:bg-white/10 text-white rounded-l-lg font-bold"
                        >
                          −
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-emerald-400">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateCartItem({ productId: product._id, quantity: item.quantity + 1 }))}
                          className="px-2.5 py-0.5 hover:bg-white/10 text-white rounded-r-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(product._id))}
                        className="text-stone-500 hover:text-red-400 ml-auto p-1.5 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="font-extrabold text-white text-base self-start">₹{price * item.quantity}</p>
                </div>
              );
            })}
          </div>

          {/* Checkout Panel */}
          <div className="md:col-span-1">
            <div className="card p-5 sticky top-20 border border-emerald-500/30 bg-[#0b0c14]/95 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4">
              <h2 className="font-extrabold text-white text-base border-b border-white/10 pb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" /> Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-300">
                  <span>Total Items</span>
                  <span className="font-mono font-bold text-white">{items.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Hostel Pickup</span>
                  <span className="text-emerald-400 font-bold">FREE ⚡</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-black text-xl text-white">
                  <span>Total</span>
                  <span className="text-emerald-400 neon-text-green">₹{total}</span>
                </div>
              </div>

              <div className="bg-[#050508] rounded-xl p-3 border border-emerald-500/20 text-xs text-stone-300 space-y-1">
                <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Instant Room Pickup
                </p>
                <p className="text-[11px] text-stone-400">
                  Seller's room number & hostel block will be revealed instantly upon payment confirmation.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Razorpay Online */}
                <button
                  onClick={handleRazorpayCheckout}
                  disabled={paying || codLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider"
                >
                  {paying ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Pay Online ₹{total}</span>
                    </>
                  )}
                </button>

                {/* COD / Pay on Pickup */}
                <button
                  onClick={handleCODCheckout}
                  disabled={paying || codLoading}
                  className="w-full bg-[#0d0e18] hover:bg-[#131524] text-white font-bold py-3 px-4 rounded-xl border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                >
                  {codLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Banknote className="h-4 w-4 text-cyan-400" />
                      <span>Pay on Pickup (Cash / UPI)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
