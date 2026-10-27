const CATEGORIES = [
  { value: "beverages", label: "🥤 Beverages" },
  { value: "snacks", label: "🍿 Snacks" },
  { value: "fruits", label: "🍎 Fruits" },
  { value: "instant-food", label: "🍜 Instant Food" },
  { value: "stationery", label: "📚 Stationery" },
  { value: "medicines", label: "💊 Medicines" },
  { value: "electronics", label: "🔌 Electronics" },
  { value: "miscellaneous", label: "🛍️ Misc" },
];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange("")}
        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
          !selected
            ? "bg-emerald-400 text-stone-950 shadow-[0_0_15px_rgba(0,255,136,0.4)]"
            : "bg-[#0b0c14] text-stone-300 border border-white/10 hover:border-emerald-500/40 hover:text-white"
        }`}
      >
        ✨ All Categories
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value === selected ? "" : cat.value)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            selected === cat.value
              ? "bg-emerald-400 text-stone-950 shadow-[0_0_15px_rgba(0,255,136,0.4)]"
              : "bg-[#0b0c14] text-stone-300 border border-white/10 hover:border-emerald-500/40 hover:text-white"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
