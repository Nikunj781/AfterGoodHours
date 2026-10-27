import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../store/slices/authSlice";
import { Eye, EyeOff, User, Mail, Lock, Home } from "lucide-react";
import Spinner from "../components/ui/Spinner";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "", roomNumber: "", block: "", hostelName: "" });
  const [showPw, setShowPw] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return;
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) navigate("/");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block p-4 rounded-3xl bg-[#0b0c14] border border-emerald-500/30 shadow-[0_0_30px_rgba(0,255,136,0.2)] text-4xl mb-1">
            🌙
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Join AfterGoodHours
          </h1>
          <p className="text-xs text-stone-400">
            Create an account to buy, sell, and pickup snacks right in your hostel
          </p>
        </div>

        <div className="card p-6 md:p-8 bg-[#0b0c14] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl font-mono">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full Name <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={update("name")}
                className="input"
                placeholder="Aryan Verma"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="input"
                placeholder="aryan@campus.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Password (min 6 chars) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={update("password")}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5" /> Room Number <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.roomNumber}
                onChange={update("roomNumber")}
                className="input"
                placeholder="e.g. 214"
              />
              <p className="text-[11px] text-stone-400 mt-1">Shared securely with buyers only after payment confirmation</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                  Block / Wing
                </label>
                <input
                  value={form.block}
                  onChange={update("block")}
                  className="input"
                  placeholder="e.g. B Block"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                  Hostel Name
                </label>
                <input
                  value={form.hostelName}
                  onChange={update("hostelName")}
                  className="input"
                  placeholder="e.g. Tagore Bhawan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider mt-2"
            >
              {loading ? <Spinner size="sm" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-5 pt-4 border-t border-white/5">
            Already registered?{" "}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
