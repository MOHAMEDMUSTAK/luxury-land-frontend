"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login } = useAuthStore();
  const router = useRouter();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (phone && phone.length < 10) e.phone = "Enter a valid 10-digit number";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Must be at least 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const toastId = toast.loading("Creating your account...");

    try {
      const res = await api.post("/auth/register", { name, email, password, phone });
      toast.success(res.data.message || "Account created successfully!", { id: toastId });
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.", { id: toastId });
    }
  };

  const clearError = (field: string) => setErrors(p => { const n = {...p}; delete n[field]; return n; });

  const inputClass = (field: string) =>
    `w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-[3px] focus:ring-brand-primary/10 ${errors[field] ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`;

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
            <h1 className="text-2xl font-bold text-text-main tracking-tight mb-1.5">Create Account</h1>
            <p className="text-sm text-text-secondary font-medium">Join our exclusive marketplace today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} placeholder="John Doe" className={inputClass("name")} />
              </div>
              {errors.name && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} placeholder="you@example.com" className={inputClass("email")} />
              </div>
              {errors.email && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clearError("phone"); }} maxLength={10} placeholder="9876543210" className={inputClass("phone")} />
              </div>
              {errors.phone && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  placeholder="Min 6 characters"
                  className={`${inputClass("password")} !pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors p-0.5">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                  placeholder="Re-enter password"
                  className={`${inputClass("confirmPassword")} !pr-12`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors p-0.5">
                  {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 mt-2"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-text-secondary font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-primary font-bold hover:text-brand-secondary transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
