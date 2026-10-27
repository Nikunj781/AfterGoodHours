import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./store/slices/authSlice";
import { fetchCart } from "./store/slices/cartSlice";
import socket from "./utils/socket";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import SellerDashboard from "./pages/SellerDashboard";
import SellProduct from "./pages/SellProduct";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import Spinner from "./components/ui/Spinner";
import Footer from "./components/Footer";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

const CheckoutSuccess = () => (
  <section className="mx-auto max-w-xl px-4 py-20 text-center fade-up">
    <div className="bg-[#0b0c14] rounded-3xl p-8 border border-emerald-500/30 shadow-[0_0_40px_rgba(0,255,136,0.2)] space-y-4">
      <div className="h-16 w-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.4)]">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-white">Payment & Order Placed! 🎉</h1>
      <p className="text-sm text-stone-300 leading-relaxed">
        Your hostel order has been recorded. Check your orders page to view the seller's room number and pickup instructions!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link to="/orders" className="btn-primary flex items-center justify-center gap-2 text-xs uppercase tracking-wider py-3 px-5">
          <Package className="h-4 w-4" /> View My Orders
        </Link>
        <Link to="/" className="btn-secondary flex items-center justify-center gap-2 text-xs uppercase tracking-wider py-3 px-5">
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

const PrivateRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      socket.connect();

      socket.on("new_order", (data) => {
        toast.success(data.message, { duration: 5000, icon: "🛒" });
      });

      socket.on("order_status_update", (data) => {
        toast.success(data.message, { duration: 5000, icon: "📦" });
      });

      return () => {
        socket.off("new_order");
        socket.off("order_status_update");
        socket.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-transparent text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
            <Route path="/checkout/success" element={<PrivateRoute><CheckoutSuccess /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
            <Route path="/seller" element={<PrivateRoute><SellerDashboard /></PrivateRoute>} />
            <Route path="/seller/add" element={<PrivateRoute><SellProduct /></PrivateRoute>} />
            <Route path="/seller/edit/:id" element={<PrivateRoute><SellProduct /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
