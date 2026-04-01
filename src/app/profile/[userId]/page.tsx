"use client";

import { use, useState, useEffect } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/utils";
import PropertyCard from "@/components/PropertyCard";
import { MapPin, Calendar, Layout, User as UserIcon, Settings, ImageOff, Mail, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = authUser?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${userId}`);
        setProfile(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold text-text-main">User not found</h1>
        <Link href="/" className="text-brand-primary hover:underline mt-4 inline-block">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-16 max-w-6xl page-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
        
        {/* Left Sidebar: Profile Card */}
        <aside className="lg:w-1/3 xl:w-1/4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-ui-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden sticky top-24"
          >
            <div className="h-24 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10" />
            <div className="px-6 pb-8 -mt-12">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg mx-auto mb-4 bg-gray-100">
                {profile.profileImage ? (
                  <Image src={profile.profileImage} alt={profile.name} fill className="object-cover" priority loading="eager" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-primary bg-brand-primary/10">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-text-main">{profile.name}</h1>
                <div className="flex items-center justify-center gap-1.5 text-text-secondary text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location || "Earth"}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Joined
                  </span>
                  <span className="font-bold text-text-main">
                    {new Date(profile.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Listings
                  </span>
                  <span className="font-bold text-text-main">{profile.totalListings}</span>
                </div>
              </div>

              {isOwner && (
                <Link 
                  href="/profile/edit" 
                  className="w-full mt-8 flex items-center justify-center gap-2 py-3.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Link>
              )}
            </div>
          </motion.div>
        </aside>

        {/* Right Content: User Listings */}
        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-text-main mb-2 tracking-tight">
              {isOwner ? "My Listings" : "Active Portfolio"}
            </h2>
            <p className="text-text-secondary font-medium">
              {isOwner ? "Manage and track your active property advertisements." : `Browse properties listed by ${profile.name}.`}
            </p>
          </div>

          {!profile.listings || profile.listings.length === 0 ? (
            <div className="py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <ImageOff className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-text-secondary font-bold tracking-widest uppercase text-xs">No active listings found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {profile.listings.map((land: any) => (
                <motion.div 
                  key={land._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PropertyCard property={land} />
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
