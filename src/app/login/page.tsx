"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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

    const toastId = toast.loading("Signing in...");

      try {
        const res = await api.post("/auth/login", { email, password });
        login(
          { 
            id: res.data.id || res.data._id, 
            name: res.data.name, 
            email: res.data.email, 
            profileImage: res.data.profileImage,
            phone: res.data.phone,
            location: res.data.location,
            role: res.data.role || "user" 
          },
          res.data.token
        );
        useWishlistStore.getState().setItems(res.data.wishlist || []);
        toast.success("Welcome back!", { id: toastId });
        router.replace("/");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Invalid credentials.", { id: toastId });
      }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20 page-fade-in">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white rounded-[20px] border border-ui-border shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-primary/20">
              L
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-main tracking-tight mb-1.5">Welcome Back</h1>
            <p className="text-sm text-text-secondary font-medium">Login to continue to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-[3px] focus:ring-brand-primary/10 ${errors.email ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`}
                />
              </div>
              {errors.email && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-text-main ml-0.5">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-brand-primary hover:text-brand-secondary transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-[3px] focus:ring-brand-primary/10 ${errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Signup Link */}
          <p className="text-center text-sm text-text-secondary font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-primary font-bold hover:text-brand-secondary transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
