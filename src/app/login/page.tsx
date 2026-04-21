"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      login(
        { 
          id: String(res.data.id || res.data._id), 
          name: res.data.name, 
          email: res.data.email, 
          profileImage: res.data.profileImage,
          phone: res.data.phone,
          location: res.data.location,
          role: res.data.role || "user",
          wishlist: res.data.wishlist || []
        },
        res.data.token
      );
      toast.success("Welcome back!");
      
      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        router.replace(redirect);
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000" />
      
      <div className="w-full max-w-[420px] relative z-10">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10 premium-card">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-3xl shadow-[0_8px_20px_rgba(99,102,241,0.3)]">
              L
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-black text-text-main tracking-tight mb-2 gradient-heading">
              Welcome Back
            </h1>
            <p className="text-[15px] text-text-secondary font-medium">
              Unlock your premium dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-text-main ml-0.5 tracking-wide">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-brand-primary transition-colors duration-300 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-white/50 text-[15px] font-semibold outline-none transition-all duration-300 placeholder:text-gray-400 focus:bg-white focus:ring-[4px] focus:ring-brand-primary/15 ${errors.email ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`}
                />
              </div>
              {errors.email && <p className="text-[12px] font-bold text-red-500 ml-1 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-text-main ml-0.5 tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-[12px] font-bold text-brand-primary hover:text-brand-secondary transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-brand-primary transition-colors duration-300 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border bg-white/50 text-[15px] font-semibold outline-none transition-all duration-300 placeholder:text-gray-400 focus:bg-white focus:ring-[4px] focus:ring-brand-primary/15 ${errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-[12px] font-bold text-red-500 ml-1 mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative flex items-center justify-center py-4 rounded-2xl bg-gradient-to-r from-brand-primary to-[#5A5DFA] text-white font-black text-[16px] tracking-wide shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_28px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-gray-200 to-gray-200" />
          </div>

          {/* Signup Link */}
          <p className="text-center text-[14px] text-text-secondary font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-primary font-black hover:text-brand-secondary transition-colors underline decoration-2 underline-offset-4 decoration-brand-primary/30 hover:decoration-brand-primary">
              Sign Up Fast
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
