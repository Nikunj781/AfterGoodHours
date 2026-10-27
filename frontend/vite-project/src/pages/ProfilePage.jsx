import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";
import Spinner from "../components/ui/Spinner";
import { User, Mail, Check, Camera, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: user?.name || "",
    roomNumber: user?.roomNumber || "",
    block: user?.block || "",
    hostelName: user?.hostelName || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("roomNumber", form.roomNumber);
    fd.append("block", form.block);
    fd.append("hostelName", form.hostelName);
    if (avatarFile) fd.append("avatar", avatarFile);

    const result = await dispatch(updateProfile(fd));
    setSaving(false);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Profile updated successfully! ✨", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
    } else {
      toast.error(result.payload || "Could not update profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card p-6 md:p-8 bg-[#0b0c14] border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-6">
        {/* Header */}
        <div className="flex items-center gap-5 border-b border-white/10 pb-6">
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={form.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-2xl font-black text-emerald-400">
                {form.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-emerald-400 text-stone-950 rounded-full p-2 cursor-pointer shadow-lg hover:bg-emerald-300 transition-colors">
              <Camera className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black text-white">{user?.name}</h1>
            <p className="text-xs text-stone-400 flex items-center gap-1.5 font-mono">
              <Mail className="h-3 w-3 text-cyan-400" /> {user?.email}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-mono">
                Room {user?.roomNumber || "Not set"}
              </span>
              {user?.rating > 0 && (
                <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs">
                  ⭐ {user.rating.toFixed(1)} rating
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 gap-3 bg-[#050508] rounded-2xl p-4 border border-white/10 text-center">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Lifetime Sales</span>
            <p className="text-xl font-black text-emerald-400 neon-text-green mt-1">₹{user?.totalSales || 0}</p>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Verified Reviews</span>
            <p className="text-xl font-black text-cyan-400 neon-text-cyan mt-1">{user?.totalReviews || 0}</p>
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
              Full Name
            </label>
            <input required value={form.name} onChange={update("name")} className="input w-full text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                Room Number
              </label>
              <input
                required
                value={form.roomNumber}
                onChange={update("roomNumber")}
                placeholder="e.g. 214"
                className="input w-full text-sm font-mono text-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                Hostel Block / Wing
              </label>
              <input
                value={form.block}
                onChange={update("block")}
                placeholder="e.g. B Block"
                className="input w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
              Hostel / Campus Name
            </label>
            <input
              value={form.hostelName}
              onChange={update("hostelName")}
              placeholder="e.g. Tagore Bhawan / North Campus"
              className="input w-full text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider mt-3"
          >
            {saving ? <Spinner size="sm" /> : <><Check className="h-4 w-4" /> Save Profile Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
