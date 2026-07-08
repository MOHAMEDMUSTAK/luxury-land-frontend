"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending reset link...");

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success("Reset link sent to your email!", { id: toastId });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send reset link.";
      toast.error(msg, { id: toastId });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20 page-fade-in">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white rounded-[20px] border border-ui-border shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10">
          {!submitted ? (
            <>
              {/* Logo/Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm">
                  <Mail className="w-7 h-7" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-text-main tracking-tight mb-2">Forgot Password?</h1>
                <p className="text-sm text-text-secondary font-medium px-4">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-text-main ml-0.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      disabled={loading}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-[3px] focus:ring-brand-primary/10 ${error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand-primary hover:border-gray-300"}`}
                    />
                  </div>
                  {error && <p className="text-[11px] font-semibold text-red-500 ml-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-main tracking-tight mb-2">Check Your Email</h1>
              <p className="text-sm text-text-secondary font-medium mb-8">
                We have sent a password reset link to <span className="text-text-main font-bold">{email}</span>. 
                The link will expire in 10 minutes.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-text-main transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
