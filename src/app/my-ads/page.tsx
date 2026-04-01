"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, Eye, Power, Heart, Loader2, MapPin, ImageOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

export default function MyAdsPage() {
  const { isAuthenticated } = useAuthStore();
  const [myAds, setMyAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyLands();
    }
  }, [isAuthenticated]);

  const fetchMyLands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/land/my-lands');
      setMyAds(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!global.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await api.delete(`/land/${id}`);
      setMyAds(prev => prev.filter(ad => ad._id !== id));
      toast.success("Ad deleted successfully");
    } catch (error) {
       toast.error("Failed to delete ad");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/land/${id}/toggle-active`);
      setMyAds(prev => prev.map(ad => ad._id === id ? { ...ad, isActive: !ad.isActive } : ad));
      toast.success("Status updated");
    } catch (error) {
       toast.error("Failed to update status");
    }
  };

  const filteredAds = myAds.filter(ad => ad.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12 max-w-6xl page-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 pb-8 border-b border-ui-border">
          <div>
            <h1 className="text-3xl font-bold text-text-main mb-2">My Property Portfolio</h1>
            <p className="text-text-secondary font-medium max-w-md">
              Review and manage your active listings with real-time performance analytics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary w-4 h-4 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in portfolio..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-ui-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-full sm:w-64 text-sm text-text-main placeholder-gray-400 transition-all font-semibold"
              />
            </div>
            <Link
              href="/my-ads/create"
              className="btn-primary shadow-sm whitespace-nowrap text-sm"
            >
              <Plus className="w-4 h-4" />
              New Listing
            </Link>
          </div>
        </div>

        {/* Ads List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-brand-primary rounded-full animate-spin" />
              <p className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">Synchronizing Assets</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="py-32 bg-white border border-ui-border rounded-3xl text-center shadow-sm">
              <p className="text-text-secondary font-bold tracking-widest uppercase">Your portfolio is currently vacant.</p>
              <Link href="/my-ads/create" className="text-brand-primary hover:underline mt-4 inline-block font-bold">Initiate Your First Listing</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredAds.map((ad) => (
                <div key={ad._id} className={`premium-card p-6 flex flex-col lg:flex-row gap-6 items-center transition-all duration-300 bg-white ${!ad.isActive && "opacity-60 grayscale shadow-none"}`}>
                  
                  {/* Image Container */}
                  <div className="relative w-full lg:w-48 h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm bg-gray-50">
                    {ad.images?.[0] ? (
                      <Image 
                        src={ad.images[0]} 
                        alt={ad.title} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 192px" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
                        <ImageOff className="w-6 h-6 text-gray-300" />
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                    {!ad.isActive && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-brand-primary font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 bg-white rounded-lg shadow-sm border border-ui-border">Draft</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                       <span className="px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-bold text-brand-primary uppercase shadow-sm">
                         {ad.propertyCategory || ad.type || "LAND"}
                       </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 w-full flex flex-col justify-between self-stretch">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Link href={`/property/${ad._id}`} className="block group/title">
                          <h3 className="font-bold text-xl text-text-main leading-snug group-hover/title:text-brand-primary transition-colors">{ad.title}</h3>
                        </Link>
                        <div className="flex items-center text-text-secondary font-semibold text-xs mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-primary" />
                          {ad.town}, {ad.district}
                        </div>
                      </div>
                      <p className="font-bold text-2xl text-brand-primary whitespace-nowrap overflow-visible">
                        {formatCurrency(ad.listingType === "rent" ? ad.rentPerMonth : ad.price)}
                        {ad.listingType === "rent" && <span className="text-xs font-semibold text-text-secondary ml-1 lowercase">/mo</span>}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-auto pt-4 border-t border-gray-50">
                       <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                             <Eye className="w-4 h-4 text-brand-primary" />
                          </div>
                          <div>
                            <p className="text-text-main font-bold text-xs">{ad.views || 0}</p>
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Views</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                             <Heart className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <p className="text-text-main font-bold text-xs">24</p>
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Saves</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col items-center gap-2.5 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50 justify-between lg:justify-center flex-shrink-0">
                    <button 
                      onClick={() => handleToggleStatus(ad._id)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${ad.isActive ? "bg-orange-50 hover:bg-orange-100 text-orange-500 border border-orange-100" : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100"}`}
                      title={ad.isActive ? "Deactivate Asset" : "Relist Asset"}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <Link 
                      href={`/edit-property/${ad._id}`}
                      className="w-11 h-11 rounded-xl bg-gray-50 text-text-secondary border border-gray-100 hover:bg-gray-100 hover:text-text-main transition-all flex items-center justify-center"
                      title="Edit Specifications"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(ad._id)}
                      className="w-11 h-11 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center"
                      title="Liquidate Asset (Delete)"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
