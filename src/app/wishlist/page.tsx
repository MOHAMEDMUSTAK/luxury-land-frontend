"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import PropertyCard from "@/components/PropertyCard";
import { Loader2, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [wishlistProperties, setWishlistProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistDetails();
  }, [items]);

  const fetchWishlistDetails = async () => {
    if (items.length === 0) {
      setWishlistProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // In a real app, we might have a batch endpoint. 
      // For now, we fetch them individually or use the home list if cached.
      // But let's fetch them to ensure fresh data.
      const properties = await Promise.all(
        items.map(async (id) => {
          try {
            const res = await api.get(`/land/${id}`);
            return res.data;
          } catch (err) {
            return null;
          }
        })
      );
      setWishlistProperties(properties.filter(p => p !== null));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-16 max-w-7xl page-fade-in">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-text-main mb-2">Saved Properties</h1>
        <p className="text-text-secondary font-medium max-w-xl">
          A curated collection of your most desired properties. Review and compare your exceptional finds.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">Consulting Your Collection</p>
        </div>
      ) : wishlistProperties.length === 0 ? (
        <div className="py-32 bg-white border border-ui-border rounded-3xl flex flex-col items-center justify-center text-center px-6 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
             <Heart className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-text-main mb-2">No saved properties yet</h2>
          <p className="text-text-secondary max-w-xs font-medium mb-8 leading-relaxed">
            Your private collection is currently empty. Explore our portfolio to discover assets that resonate with your vision.
          </p>
          <Link 
            href="/" 
            className="btn-primary group"
          >
            Discover Properties
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
