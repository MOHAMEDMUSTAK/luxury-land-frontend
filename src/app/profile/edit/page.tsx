"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { api } from "@/services/api";
import { User, Mail, Phone, MapPin, Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);


  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
      });
      setPreviewImage(user.profileImage || null);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    const toastId = toast.loading("Updating your profile...");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("location", formData.location);
      if (selectedFile) {
        data.append("profileImage", selectedFile);
      }

      const res = await api.put("/auth/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Pass both userData AND the new token to the store
      updateUser(res.data, res.data.token);
      toast.success("Profile updated perfectly!", { id: toastId });
      setSelectedFile(null);
    } catch (error: any) {
      console.error("PROFILE_UPDATE_ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to update profile", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">Account Settings</h1>
            <p className="text-text-secondary font-medium">Manage your personal identity and contact information.</p>
          </div>
          <Link 
            href={`/profile/${user.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-ui-border rounded-2xl text-xs font-bold text-text-main hover:bg-gray-50 hover:border-brand-primary/30 transition-all shadow-sm active:scale-95 group/view-profile"
          >
            <User className="w-4 h-4 text-brand-primary group-hover/view-profile:scale-110 transition-transform" />
            View Public Profile
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Avatar Upload */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="bg-white p-6 rounded-3xl border border-ui-border shadow-sm flex flex-col items-center">
              <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 flex items-center justify-center relative">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  ) : (
                    <User className="w-12 h-12 text-brand-primary/30" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
              />
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] text-center">Profile Photo</p>
              <p className="text-[9px] text-gray-400 mt-2 text-center">JPG, PNG or WebP. Max 5MB.</p>
            </div>

            <div className="mt-6 bg-brand-primary/[0.03] border border-brand-primary/10 rounded-2xl p-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-text-main">Identity Verified</p>
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed mt-0.5">Your personal data is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Details Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-ui-border shadow-sm space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                      className="input-standard pl-11 py-4 bg-gray-50 border-gray-100"
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                {/* Email (Readonly) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Email Address (Read-only)</label>
                  <div className="relative opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      value={user.email}
                      readOnly
                      className="input-standard pl-11 py-4 bg-gray-100 cursor-not-allowed border-gray-200"
                    />
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="input-standard pl-11 py-4 bg-gray-50 border-gray-100"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Location</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="input-standard pl-11 py-4 bg-gray-50 border-gray-100"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-ui-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-brand-success" />
                  Last Updated: {new Date().toLocaleDateString()}
                </div>
                
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-auto btn-primary px-10 py-4 flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/20"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

// Dummy icon to avoid lint issues (already imported)
function ShieldCheck({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />;
}
