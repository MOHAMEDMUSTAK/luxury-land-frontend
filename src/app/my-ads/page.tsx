"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, Eye, Power, Heart, Loader2, MapPin, ImageOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import PropertySkeleton from "@/components/PropertySkeleton";

export default function MyAdsPage() {
  const { isAuthenticated } = useAuthStore();
  const [myAds, setMyAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: adsData, isLoading: loading } = useQuery({
    queryKey: ['my-lands'],
    queryFn: async () => {
      const res = await api.get('/land/my-lands');
      return res.data?.data || res.data;
    },
    enabled: isAuthenticated
  });

  useEffect(() => {
    if (adsData) {
      setMyAds(adsData);
    }
  }, [adsData]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this luxury asset?")) return;
    try {
      await api.delete(`/land/${id}`);
      setMyAds(prev => prev.filter(ad => ad._id !== id));
      toast.success("Asset liquidated successfully");
      queryClient.invalidateQueries({ queryKey: ['lands'] });
      queryClient.invalidateQueries({ queryKey: ['trending-properties'] });
      queryClient.invalidateQueries({ queryKey: ['my-lands'] });
    } catch (error) {
       toast.error("Failed to process deletion");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.patch(`/land/${id}/toggle-active`);
      setMyAds(prev => prev.map(ad => ad._id === id ? { ...ad, isActive: !ad.isActive } : ad));
      toast.success("Asset status updated");
      queryClient.invalidateQueries({ queryKey: ['lands'] });
      queryClient.invalidateQueries({ queryKey: ['trending-properties'] });
      queryClient.invalidateQueries({ queryKey: ['land', id] });
    } catch (error) {
       toast.error("Failed to update status");
    }
  };

  const filteredAds = (Array.isArray(myAds) ? myAds : []).filter(ad => (ad?.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()));

  return (
      <div className="container mx-auto px-4 py-12 max-w-6xl relative">
        
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 pb-8 border-b border-ui-border relative z-10 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-black text-text-main mb-3 tracking-tight gradient-heading">Property Portfolio</h1>
            <p className="text-text-secondary font-semibold max-w-md text-[15px]">
              Review and manage your exclusive listings with real-time performance analytics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary w-5 h-5 transition-colors duration-300" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in portfolio..."
                className="pl-12 pr-4 py-3.5 bg-white border border-ui-border rounded-2xl focus:outline-none focus:ring-[4px] focus:ring-brand-primary/15 focus:border-brand-primary w-full sm:w-72 text-[15px] text-text-main placeholder-gray-400 transition-all font-semibold shadow-sm"
              />
            </div>
            <Link
              href="/my-ads/create"
              className="btn-primary btn-premium-glow shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_28px_rgba(99,102,241,0.35)] whitespace-nowrap text-[15px] px-6 h-[52px]"
            >
              <Plus className="w-5 h-5 mr-1" />
              New Listing
            </Link>
          </div>
        </div>

        {/* Ads List */}
        <div className="space-y-6 relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
               {[...Array(3)].map((_, i) => <PropertySkeleton key={i} />)}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="py-32 px-4 bg-white/70 backdrop-blur-xl border border-ui-border rounded-[32px] text-center shadow-[0_8px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-text-main mb-2">Portfolio Vacant</h3>
              <p className="text-text-secondary font-medium mb-8 max-w-sm mx-auto">You currently have no active listings matching your criteria.</p>
              <Link href="/my-ads/create" className="btn-primary btn-premium-glow inline-flex">
                Initiate Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
                {filteredAds.map((ad) => (
                  <div 
                    key={ad._id} 
                    className={`premium-card p-6 flex flex-col lg:flex-row gap-6 items-center w-full transition-all duration-500 relative overflow-hidden group ${!ad.isActive ? "opacity-65 grayscale-[30%] hover:grayscale-0" : "luxe-lift"}`}
                  >
                    {/* Status Glow Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${ad.isActive ? 'bg-green-400' : 'bg-orange-400'} shadow-[0_0_12px_currentColor] opacity-70`} />
                    
                    {/* Image Container */}
                    <div className="relative w-full lg:w-[220px] h-[160px] rounded-[20px] overflow-hidden flex-shrink-0 shadow-sm bg-gray-100">
                      {ad.images?.[0] ? (
                        <Image 
                          src={ad.images[0]} 
                          alt={ad.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          sizes="(max-width: 1024px) 100vw, 220px" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
                          <ImageOff className="w-8 h-8 text-gray-300" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Imagery</span>
                        </div>
                      )}
                      
                      {/* Gradients & Badges */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {!ad.isActive && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] flex items-center justify-center z-10">
                          <span className="text-orange-600 font-bold text-[11px] tracking-widest uppercase px-4 py-2 bg-white/90 rounded-xl shadow-sm border border-orange-100">Draft Status</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 z-10">
                         <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-bold text-brand-primary uppercase shadow-sm">
                           {ad.propertyCategory || ad.type || "LAND"}
                         </span>
                      </div>
                    </div>

                    {/* Details Container */}
                    <div className="flex-1 w-full flex flex-col justify-between self-stretch py-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                        <div>
                          <Link href={`/property/${ad._id}`} className="block group/title">
                            <h3 className="font-bold text-[22px] text-text-main leading-snug group-hover/title:text-brand-primary transition-colors line-clamp-2">{ad.title}</h3>
                          </Link>
                          <div className="flex items-center text-text-secondary font-semibold text-[13px] mt-2 bg-gray-50 inline-flex px-2 py-1 rounded-lg">
                            <MapPin className="w-4 h-4 mr-1.5 text-brand-primary" />
                            {ad.town}, {ad.district}
                          </div>
                        </div>
                        <p className="font-black text-[26px] gradient-price whitespace-nowrap overflow-visible">
                          {formatCurrency(ad.listingType === "rent" ? ad.rentPerMonth : ad.price)}
                          {ad.listingType === "rent" && <span className="text-sm font-bold text-text-secondary ml-1 lowercase">/mo</span>}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-8 mt-auto pt-5 border-t border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                               <Eye className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                              <p className="text-text-main font-bold text-[14px]">{ad.views || 0}</p>
                              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Views</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 group-hover:bg-rose-100 transition-colors">
                               <Heart className="w-5 h-5 text-rose-400" />
                            </div>
                             <div>
                              <p className="text-text-main font-bold text-[14px]">{ad.wishlistCount || 0}</p>
                              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Saves</p>
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-row lg:flex-col items-center gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-100 justify-between lg:justify-center flex-shrink-0 lg:pl-6 lg:border-l">
                      <button 
                        onClick={() => handleToggleStatus(ad._id)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all ${ad.isActive ? "bg-orange-50 hover:bg-orange-100 text-orange-500 border border-orange-200" : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200"}`}
                        title={ad.isActive ? "Deactivate Asset" : "Relist Asset"}
                      >
                        <Power className="w-[22px] h-[22px]" />
                      </button>
                      <Link href={`/edit-property/${ad._id}`}>
                        <div
                          className="w-12 h-12 rounded-2xl bg-gray-50 text-text-secondary border border-gray-200 hover:bg-white hover:shadow-md hover:text-brand-primary transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                          title="Edit Specifications"
                        >
                          <Edit2 className="w-[22px] h-[22px]" />
                        </div>
                      </Link>
                      <button 
                        onClick={() => handleDelete(ad._id)}
                        className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                        title="Liquidate Asset (Delete)"
                      >
                        <Trash2 className="w-[22px] h-[22px]" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
  );
}
