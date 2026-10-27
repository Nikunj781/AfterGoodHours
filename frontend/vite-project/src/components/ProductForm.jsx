import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../constants";
import Spinner from "./ui/Spinner";
import { Upload, X, Link as LinkIcon, Sparkles } from "lucide-react";

const PRESET_PHOTOS = [
  { label: "Maggi / Noodles", category: "instant-food", url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80" },
  { label: "Red Bull / Energy", category: "beverages", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80" },
  { label: "Cold Coffee", category: "beverages", url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80" },
  { label: "Chips / Snacks", category: "snacks", url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80" },
  { label: "Chocolate / Sweet", category: "snacks", url: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&auto=format&fit=crop&q=80" },
  { label: "Fresh Fruits", category: "fruits", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80" },
  { label: "Spiral Notebook", category: "stationery", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80" },
  { label: "Fast Charger / Cable", category: "electronics", url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80" },
  { label: "Medicine / Relief", category: "medicines", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80" },
  { label: "Desk Lamp / Dorm", category: "miscellaneous", url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80" },
];

export default function ProductForm({ initial, submitting, onSubmit, submitLabel }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    price: initial?.price ?? "",
    quantity: initial?.quantity ?? 1,
    category: initial?.category || "snacks",
  });
  const [files, setFiles] = useState([]);
  const [selectedUrls, setSelectedUrls] = useState(initial?.images || []);
  const [urlInput, setUrlInput] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        price: initial.price ?? "",
        quantity: initial.quantity ?? 1,
        category: initial.category || "snacks",
      });
      setSelectedUrls(initial.images || []);
    }
  }, [initial]);

  const filePreviews = useMemo(
    () => files.map((f, idx) => ({ id: idx, name: f.name, url: URL.createObjectURL(f), file: f })),
    [files]
  );

  useEffect(() => () => filePreviews.forEach((p) => URL.revokeObjectURL(p.url)), [filePreviews]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 4));
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeUrl = (urlToRemove) => {
    setSelectedUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const addCustomUrl = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!selectedUrls.includes(trimmed)) {
      setSelectedUrls((prev) => [...prev, trimmed].slice(0, 4));
    }
    setUrlInput("");
  };

  const selectPreset = (presetUrl, presetCategory) => {
    if (!selectedUrls.includes(presetUrl)) {
      setSelectedUrls((prev) => [...prev, presetUrl].slice(0, 4));
    }
    if (presetCategory && !initial) {
      setForm((prev) => ({ ...prev, category: presetCategory }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("price", form.price);
    fd.append("quantity", form.quantity);
    fd.append("category", form.category);

    files.forEach((file) => fd.append("images", file));

    if (selectedUrls.length > 0) {
      fd.append("imageUrls", JSON.stringify(selectedUrls));
    }

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5 bg-[#0b0c14] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] fade-up">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
          Product Title <span className="text-red-400">*</span>
        </label>
        <input
          required
          value={form.title}
          onChange={update("title")}
          className="input w-full"
          placeholder="e.g. Maggi 4-Pack, Chilled Red Bull Can, Spiral Notebook..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
          Description & Pickup Notes <span className="text-red-400">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={update("description")}
          className="input w-full resize-none"
          placeholder="Condition, expiry date, best time to collect from your hostel room..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
            Price (₹) <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={update("price")}
            className="input w-full font-mono text-emerald-400 font-bold"
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
            Quantity In Stock <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="number"
            min="1"
            value={form.quantity}
            onChange={update("quantity")}
            className="input w-full font-mono"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
            Category
          </label>
          <select value={form.category} onChange={update("category")} className="input w-full cursor-pointer">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#0b0c14] text-white">
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Images Selector Section */}
      <div className="border border-white/10 rounded-2xl p-4 bg-[#050508] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white">
              Product Photos (Up to 4)
            </label>
            <p className="text-[11px] text-stone-400">Upload from device, paste a URL, or choose preset photos</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showPresets ? "Hide Presets" : "⚡ Popular Hostel Photos"}
          </button>
        </div>

        {/* Preset Photos Gallery */}
        {showPresets && (
          <div className="bg-[#0d0e18] p-3 rounded-xl border border-cyan-500/30 space-y-2 fade-up">
            <p className="text-xs font-medium text-stone-300">Click any preset to add it to your listing:</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
              {PRESET_PHOTOS.map((preset) => {
                const isSelected = selectedUrls.includes(preset.url);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => selectPreset(preset.url, preset.category)}
                    className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all ${
                      isSelected
                        ? "border-emerald-400 shadow-[0_0_12px_rgba(0,255,136,0.6)]"
                        : "border-white/10 hover:border-emerald-500/40"
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="h-16 w-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="block text-[10px] font-bold p-1 truncate text-white bg-black/80">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-emerald-400 text-stone-950 font-black rounded-full p-0.5 text-[10px] leading-none">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Buttons & URL Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* File Upload Button */}
          <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer text-xs py-2 px-3 border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300">
            <Upload className="h-4 w-4" />
            <span>Upload Photo(s)</span>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          </label>

          {/* URL Input */}
          <div className="flex flex-1 gap-1.5">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste an image URL (https://...)"
              className="input flex-1 text-xs py-1.5"
            />
            <button
              type="button"
              onClick={addCustomUrl}
              className="btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1"
            >
              <LinkIcon className="h-3.5 w-3.5 text-stone-400" />
              Add
            </button>
          </div>
        </div>

        {/* Selected Photos Preview */}
        {(filePreviews.length > 0 || selectedUrls.length > 0) && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <p className="text-xs font-semibold text-stone-300">Selected Photos ({filePreviews.length + selectedUrls.length}/4):</p>
            <div className="flex gap-2 flex-wrap">
              {filePreviews.map((p, idx) => (
                <div key={p.url} className="relative group h-20 w-20 rounded-xl overflow-hidden border border-emerald-500/40 bg-[#0b0c14] shadow-md">
                  <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-emerald-300 text-center py-0.5 font-mono">
                    Upload
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-black/80 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {selectedUrls.map((url) => (
                <div key={url} className="relative group h-20 w-20 rounded-xl overflow-hidden border border-cyan-500/40 bg-[#0b0c14] shadow-md">
                  <img src={url} alt="Selected" className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-cyan-300 text-center py-0.5 font-mono">
                    URL Link
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUrl(url)}
                    className="absolute top-1 right-1 bg-black/80 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider"
      >
        {submitting ? <Spinner size="sm" /> : submitLabel}
      </button>
    </form>
  );
}
