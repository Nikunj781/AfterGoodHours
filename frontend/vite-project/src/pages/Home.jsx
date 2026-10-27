import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../store/slices/productSlice";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import Spinner from "../components/ui/Spinner";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Moon, Flame, Zap, Heart } from "lucide-react";

export default function Home() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, total, pages, currentPage, loading } = useSelector((s) => s.products);
  const wishlistItems = useSelector((s) => s.wishlist?.items || []);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState(searchParams.get("filter") || "");

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) setActiveQuickFilter(f);
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sort, order, minPrice, maxPrice, activeQuickFilter]);

  useEffect(() => {
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (sort) { params.sort = sort; params.order = order; }
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    // Apply quick filters
    if (activeQuickFilter === "under50") {
      params.maxPrice = 50;
    } else if (activeQuickFilter === "midnight") {
      params.category = "instant-food";
    } else if (activeQuickFilter === "beverages") {
      params.category = "beverages";
    }

    dispatch(fetchProducts(params));
  }, [dispatch, debouncedSearch, category, sort, order, minPrice, maxPrice, page, activeQuickFilter]);

  const handleQuickTag = (tag) => {
    if (activeQuickFilter === tag) {
      setActiveQuickFilter("");
      setSearchParams({});
    } else {
      setActiveQuickFilter(tag);
      if (tag === "wishlist") {
        setSearchParams({ filter: "wishlist" });
      } else {
        setSearchParams({});
      }
    }
  };

  const displayedProducts = activeQuickFilter === "wishlist" ? wishlistItems : products;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Neon Cyber Hero Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-br from-[#0c0d18] via-[#050508] to-[#0a1215] border border-emerald-500/30 shadow-[0_0_40px_rgba(0,255,136,0.12)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(0,255,136,0.2)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live In Your Hostel · Instant Room Pickup
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Midnight Snacks & Gear, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 neon-text-green">
                One Floor Away.
              </span>
            </h1>
            <p className="text-stone-300 text-sm md:text-base leading-relaxed">
              Don't wait for delivery riders. Buy leftover snacks, chilled energy drinks, and urgent essentials directly from dorm mates.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex md:flex-col gap-3 bg-[#0d0e18]/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div>
              <span className="text-[11px] font-mono uppercase text-emerald-400">⚡ Average Pickup</span>
              <p className="text-lg font-bold text-white">4 Minutes</p>
            </div>
            <div className="border-l md:border-l-0 md:border-t border-white/10 pl-3 md:pl-0 md:pt-2">
              <span className="text-[11px] font-mono uppercase text-cyan-400">🌙 Active Hours</span>
              <p className="text-lg font-bold text-white">24/7 Hostel Wide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Neon Quick Filter Tags */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => handleQuickTag("")}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeQuickFilter === ""
              ? "bg-emerald-400 text-stone-950 shadow-[0_0_15px_rgba(0,255,136,0.5)]"
              : "bg-white/5 text-stone-300 border border-white/10 hover:border-emerald-500/40"
          }`}
        >
          ⚡ All Listings
        </button>

        <button
          onClick={() => handleQuickTag("wishlist")}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "wishlist"
              ? "bg-pink-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]"
              : "bg-white/5 text-pink-300 border border-pink-500/30 hover:border-pink-500/60"
          }`}
        >
          <Heart className="h-3 w-3 fill-current" />
          My Wishlist ({wishlistItems.length})
        </button>

        <button
          onClick={() => handleQuickTag("under50")}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "under50"
              ? "bg-cyan-400 text-stone-950 shadow-[0_0_15px_rgba(0,240,255,0.5)]"
              : "bg-white/5 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60"
          }`}
        >
          <Flame className="h-3 w-3" />
          Under ₹50
        </button>

        <button
          onClick={() => handleQuickTag("midnight")}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "midnight"
              ? "bg-amber-400 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              : "bg-white/5 text-amber-300 border border-amber-500/30 hover:border-amber-500/60"
          }`}
        >
          <Moon className="h-3 w-3" />
          Midnight Noodles
        </button>

        <button
          onClick={() => handleQuickTag("beverages")}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "beverages"
              ? "bg-blue-400 text-stone-950 shadow-[0_0_15px_rgba(96,165,250,0.5)]"
              : "bg-white/5 text-blue-300 border border-blue-500/30 hover:border-blue-500/60"
          }`}
        >
          <Zap className="h-3 w-3" />
          Chilled Drinks
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Maggi, Red Bull, notebook, charger..."
            className="input pl-10 text-sm"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${
            showFilters ? "border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(0,255,136,0.25)]" : ""
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>

        <select
          value={`${sort}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split("-");
            setSort(s);
            setOrder(o);
          }}
          className="input w-auto text-sm cursor-pointer"
        >
          <option value="createdAt-desc" className="bg-[#0b0c14] text-white">✨ Newest First</option>
          <option value="price-asc" className="bg-[#0b0c14] text-white">Price: Low → High</option>
          <option value="price-desc" className="bg-[#0b0c14] text-white">Price: High → Low</option>
        </select>
      </div>

      {/* Expandable Price Filters */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-4 border border-emerald-500/30 bg-[#0d0e18]/90 fade-up">
          <div>
            <label className="text-xs font-semibold text-emerald-400 mb-1 block">Min Price (₹)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="input w-28 text-sm"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-emerald-400 mb-1 block">Max Price (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              className="input w-28 text-sm"
              min="0"
            />
          </div>
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              setSearch("");
              setCategory("");
              setActiveQuickFilter("");
            }}
            className="btn-secondary self-end text-xs py-2 px-3 hover:text-red-400"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Category Pills */}
      {activeQuickFilter !== "wishlist" && (
        <CategoryFilter selected={category} onChange={setCategory} />
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono tracking-wider uppercase text-stone-400">
          {activeQuickFilter === "wishlist"
            ? `💖 Saved Items (${wishlistItems.length})`
            : `${total} items ready for hostel pickup`}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-20 card p-8 border border-white/10 space-y-3">
          <p className="text-5xl mb-2">🏪</p>
          <h3 className="text-lg font-bold text-white">
            {activeQuickFilter === "wishlist" ? "Your wishlist is empty" : "No items found"}
          </h3>
          <p className="text-stone-400 text-sm max-w-sm mx-auto">
            {activeQuickFilter === "wishlist"
              ? "Click the heart icon on any product to save it here for later!"
              : "Be the first to list snacks, gadgets, or stationery for your floor!"}
          </p>
          {activeQuickFilter === "wishlist" ? (
            <button onClick={() => setActiveQuickFilter("")} className="btn-primary mt-2">
              Browse Products
            </button>
          ) : (
            <button onClick={() => { setSearch(""); setCategory(""); setActiveQuickFilter(""); }} className="btn-secondary mt-2">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
          {displayedProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {activeQuickFilter !== "wishlist" && pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-xs font-mono text-stone-400">
            Page <strong className="text-white">{page}</strong> of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn-secondary flex items-center gap-1 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
