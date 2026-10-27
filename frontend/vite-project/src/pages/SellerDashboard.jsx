import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { deleteProduct, fetchMyProducts } from "../store/slices/productSlice";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/ui/Spinner";
import { CATEGORY_EMOJI, ORDER_STATUS } from "../constants";
import { formatDate, formatPrice, timeLeft } from "../utils/format";
import api from "../utils/axios";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2, Store, Package } from "lucide-react";

export default function SellerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProducts } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState("listings");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    dispatch(fetchMyProducts()).finally(() => setLoadingList(false));
    api.get("/orders/seller")
      .then((r) => setOrders(r.data.orders || []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!confirm("Remove this listing?")) return;
    const result = await dispatch(deleteProduct(id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Listing removed", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
    } else {
      toast.error(result.payload || "Could not delete");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      toast.success("Order status updated! 📦", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  return (
    <div className="page-wrap space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <Store className="h-7 w-7 text-emerald-400 neon-text-green" /> Seller Desk
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            {user?.name} · Room {user?.roomNumber || "N/A"} · <span className="text-emerald-400 font-mono font-bold">{formatPrice(user?.totalSales || 0)}</span> lifetime sales
          </p>
        </div>
        <Link to="/seller/add" className="btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider py-2.5 px-4">
          <Plus className="h-4 w-4" /> Add New Listing
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        {[
          { key: "listings", label: `My Listings (${myProducts.length})` },
          { key: "orders", label: `Incoming Orders (${orders.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === t.key
                ? "bg-emerald-400 text-stone-950 shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                : "bg-[#0b0c14] text-stone-300 border border-white/10 hover:border-emerald-500/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {tab === "listings" && (
        loadingList ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : myProducts.length === 0 ? (
          <EmptyState emoji="🏪" title="No products listed yet" text="List a leftover snack, extra charger, or notebook for your hostel mates.">
            <Link to="/seller/add" className="btn-primary mt-3">Add Your First Product</Link>
          </EmptyState>
        ) : (
          <div className="grid gap-3">
            {myProducts.map((p) => (
              <div key={p._id} className="card p-4 flex gap-4 items-center bg-[#0b0c14] border border-white/10 hover:border-emerald-500/30">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#050508] border border-white/10 flex-shrink-0">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl">
                      {CATEGORY_EMOJI[p.category] || "📦"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{p.title}</h3>
                  <p className="text-emerald-400 font-extrabold text-base neon-text-green">{formatPrice(p.price)}</p>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    {p.quantity} in stock · {p.totalSold || 0} sold · {timeLeft(p.expiresAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/seller/edit/${p._id}`)}
                    className="btn-secondary p-2.5 text-stone-300 hover:text-emerald-400 border-white/10 hover:border-emerald-500/40"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="btn-secondary p-2.5 text-stone-400 hover:text-red-400 border-white/10 hover:border-red-500/40"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        loadingOrders ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <EmptyState emoji="📦" title="No incoming orders yet" text="When a dorm mate orders your items, they will show up here instantly." />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const meta = ORDER_STATUS[o.status] || ORDER_STATUS.paid;
              return (
                <div key={o._id} className="card p-5 bg-[#0b0c14] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start gap-3 flex-wrap border-b border-white/10 pb-3">
                    <div>
                      <p className="font-bold text-white text-sm">
                        Buyer: {o.buyer?.name || "Student"}
                      </p>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">{formatDate(o.createdAt)}</p>
                    </div>
                    <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs">
                      {meta.label}
                    </span>
                  </div>

                  <ul className="text-xs text-stone-300 space-y-1 font-mono">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{i.quantity}× {i.title}</span>
                        <span className="text-white font-bold">{formatPrice(i.price)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-xs text-stone-400">Total Order Value</span>
                    <span className="text-lg font-black text-emerald-400 neon-text-green">{formatPrice(o.totalAmount)}</span>
                  </div>

                  <div className="flex gap-2 pt-2 flex-wrap">
                    {o.status === "paid" && (
                      <button
                        onClick={() => updateStatus(o._id, "ready_for_pickup")}
                        className="btn-primary text-xs py-2 px-3 font-bold"
                      >
                        ✓ Mark Ready For Pickup
                      </button>
                    )}
                    {o.status === "ready_for_pickup" && (
                      <button
                        onClick={() => updateStatus(o._id, "completed")}
                        className="btn-cyan text-xs py-2 px-3 font-bold"
                      >
                        ✓ Mark Completed (Handed Over)
                      </button>
                    )}
                    {o.status === "completed" && (
                      <span className="text-xs font-mono text-emerald-400 font-semibold py-1">
                        ✓ Order Completed Successfully
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
