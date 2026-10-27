import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#050508]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span>🌙</span>
          <p className="font-semibold text-white">
            AfterGood<span className="text-emerald-400 neon-text-green">Hours</span>
          </p>
          <span className="text-stone-600">·</span>
          <span>Hostel Night-Owl Deals</span>
        </div>
        <div className="flex gap-5 text-stone-400 font-medium">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Browse Marketplace</Link>
          <Link to="/seller" className="hover:text-emerald-400 transition-colors">Sell an Item</Link>
          <Link to="/orders" className="hover:text-emerald-400 transition-colors">My Orders</Link>
          <Link to="/profile" className="hover:text-emerald-400 transition-colors">Profile</Link>
        </div>
      </div>
    </footer>
  );
}
