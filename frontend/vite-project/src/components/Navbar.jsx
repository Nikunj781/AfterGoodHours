import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";
import { ShoppingCart, Heart, Menu, X, Store, Package, User, LogOut, ChevronDown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useSelector((s) => s.wishlist?.items?.length || 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/login");
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="bg-[#050508]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Neon Brand Glow */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl transform group-hover:scale-110 transition-transform">🌙</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                AfterGood<span className="text-emerald-400 neon-text-green">Hours</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Hostel Night Owl
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold text-stone-300 hover:text-emerald-400 transition-colors"
            >
              Browse
            </Link>

            {user && (
              <>
                <Link
                  to="/seller"
                  className="text-sm font-semibold text-stone-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                >
                  <Store className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Sell</span>
                </Link>

                <Link
                  to="/orders"
                  className="text-sm font-semibold text-stone-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                >
                  <Package className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Orders</span>
                </Link>

                {/* Wishlist Icon */}
                <Link
                  to="/?filter=wishlist"
                  className="relative p-2 text-stone-300 hover:text-pink-400 transition-colors"
                  title="My Wishlist"
                >
                  <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "fill-pink-500 text-pink-500" : ""}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon with Neon Glow */}
                <Link
                  to="/cart"
                  className="relative p-2 text-stone-300 hover:text-emerald-400 transition-colors"
                  title="Your Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-400 text-stone-950 text-xs rounded-full h-5 w-5 flex items-center justify-center font-black shadow-[0_0_12px_rgba(0,255,136,0.7)] animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 text-sm font-medium text-white hover:border-emerald-400 transition-all bg-[#0d0e18] py-1.5 px-3 rounded-full border border-white/15"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover border border-emerald-400" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[110px] truncate">{user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0a0b12] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-emerald-500/30 py-2 z-50 fade-up">
                      <div className="px-4 py-2.5 border-b border-white/10">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-emerald-400 font-mono">Room {user.roomNumber || "Not set"}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                      >
                        <User className="h-4 w-4 text-emerald-400" /> Profile Settings
                      </Link>
                      <Link
                        to="/seller"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                      >
                        <Store className="h-4 w-4 text-cyan-400" /> Seller Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-stone-300 hover:text-emerald-400 transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2 px-5"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <>
                <Link to="/?filter=wishlist" className="relative p-1 text-stone-300">
                  <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "fill-pink-500 text-pink-500" : ""}`} />
                </Link>
                <Link to="/cart" className="relative p-1 text-stone-300">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-400 text-stone-950 text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-1 hover:text-emerald-400"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-2 bg-[#050508] fade-up">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-white py-2 hover:text-emerald-400">
              🏠 Browse Marketplace
            </Link>
            {user ? (
              <>
                <Link to="/seller" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-white py-2 hover:text-emerald-400">
                  🏪 Sell a Product
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-white py-2 hover:text-emerald-400">
                  📦 My Orders
                </Link>
                <Link to="/?filter=wishlist" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-white py-2 hover:text-pink-400">
                  💖 Wishlist ({wishlistCount})
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-white py-2 hover:text-emerald-400">
                  👤 Profile ({user.name})
                </Link>
                <button onClick={handleLogout} className="block w-full text-left text-sm font-medium text-red-400 py-2">
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-stone-300 py-2">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary block text-center">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
    </nav>
  );
}
