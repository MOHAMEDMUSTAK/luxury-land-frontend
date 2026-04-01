"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");

  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in both fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating password...");

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setResetSuccess(true);
      toast.success("Password reset successful!", { id: toastId });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      toast.error(msg, { id: toastId });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20 page-fade-in">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-[20px] border border-ui-border shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight mb-2">Password Reset!</h1>
            <p className="text-sm text-text-secondary font-medium mb-8">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Link 
              href="/login"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Sign In Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20 page-fade-in">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-[20px] border border-ui-border shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Lock className="w-7 h-7" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-main tracking-tight mb-2">Set New Password</h1>
            <p className="text-sm text-text-secondary font-medium px-4">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Min 6 characters"
                  disabled={loading}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-[3px] focus:ring-brand-primary/10 ${error && error.includes("Password") ? "border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-main ml-0.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Re-enter password"
                  disabled={loading}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-[3px] focus:ring-brand-primary/10 ${error && error.includes("match") ? "border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors p-0.5"
                >
                  {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {error && <p className="text-[11px] font-semibold text-red-500 ml-1 mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
