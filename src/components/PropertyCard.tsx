"use client";

import { useState, memo, useCallback } from "react";
import { Heart, MapPin, Maximize2, ImageOff, BarChart2, Star, Share2, Camera, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency, getTimeOnMarket } from "@/lib/utils";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { requireStrictAuth } from "@/lib/authUtils";
import { useQueryClient } from "@tanstack/react-query";
// CSS animations used instead of Framer Motion for better grid performance

const MapModal = dynamic(() => import("./MapModal"), { ssr: false });

interface PropertyCardProps {
  property: {
    _id?: string;
    id?: string;
    title: string;
    images?: string[];
    town?: string;
    state?: string;
    location?: string;
    propertyCategory?: string;
    type?: string;
    size?: string;
    sizeUnit?: string;
    landType?: string;
    latitude?: number;
    lat?: number;
    longitude?: number;
    lng?: number;
    owner?: any;
    reviewCount?: number;
    averageRating?: number;
    status?: string;
    listingType?: string;
    rentPerMonth?: number;
    price?: number;
    createdAt?: string;
  };
  priority?: boolean;
}

const PropertyCard = memo(({ property, priority = false }: PropertyCardProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const { hasItem, toggleItem } = useWishlistStore();
  const { addProperty, removeProperty, isInCompare } = useCompareStore();
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();
  const queryClient = useQueryClient();
  
  const propertyId = String(property._id || property.id);
  const isWishlisted = hasItem(propertyId);
  const isCompared = isInCompare(propertyId);
  
  const handleToggleCompare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10]);
    
    if (isCompared) {
      removeProperty(propertyId as string);
      toast("Removed from Compare", { icon: "ℹ️" });
    } else {
      addProperty(property as any);
    }
  }, [isCompared, propertyId, removeProperty, addProperty, property]);

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // High premium tactile feedback on interaction 
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15]);
    }
    
    if (isCheckingAuth) return;

    if (!requireStrictAuth(isAuthenticated, window.location.pathname)) {
      return;
    }

    if (isWishlisting) return;
    
    setIsWishlisting(true);
    try {
      await toggleItem(propertyId as string, user?.id);
      if (!isWishlisted) {
        toast.success("Added to Wishlist");
      } else {
        toast("Removed from Wishlist", { icon: "ℹ️" });
      }
    } finally {
      setIsWishlisting(false);
    }
  }, [isCheckingAuth, isAuthenticated, isWishlisting, isWishlisted, propertyId, user?.id, toggleItem, t]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // High premium tactile feedback on interaction 
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15]);
    }

    // Natively invoke OS capabilities like a native app
    if (navigator.share) {
      try {
        const formattedPrice = property.listingType === "rent" ? property.rentPerMonth : property.price;
        const priceText = formattedPrice ? ` for ${formatCurrency(formattedPrice)}` : "";
        const locationText = property.town ? ` in ${property.town}` : "";
        
        await navigator.share({
          title: property.title,
          text: `Found this incredible property on LuxuryLand ✨ ${property.title}${locationText}${priceText}. Check it out!`,
          url: `${window.location.origin}/property/${propertyId}`
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/property/${propertyId}`);
      toast.success("Link copied to clipboard!");
    }
  }, [property.title, propertyId]);

  const hasImage = property.images && property.images.length > 0;
  const mainImage = hasImage ? property.images![0] : null;
  const imageCount = property.images?.length ?? 0;

  // "NEW" badge — show for listings posted within the last 24 hours
  const isNewListing = property.createdAt
    ? Date.now() - new Date(property.createdAt).getTime() < 24 * 60 * 60 * 1000
    : false;
  const location = property.town 
    ? (property.town === property.state ? property.town : `${property.town}, ${property.state}`)
    : (property.location || "Location not available");
  const categoryLabel = property.propertyCategory === "land" ? "Land" : property.propertyCategory === "house" ? "House" : property.propertyCategory === "shop" ? "Shop" : property.type || "Property";
  const sizeDisplay = property.size
    ? `${property.size} ${property.sizeUnit || "sq ft"}`
    : null;

  const handleOpenMap = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMapOpen(true);
  }, []);

  const handleNavigate = useCallback((e: React.MouseEvent) => {
    // Intercept property views for guests
    if (!requireStrictAuth(isAuthenticated, `/property/${propertyId}`)) {
       e.preventDefault();
       return;
    }
    router.push(`/property/${propertyId}`);
  }, [router, propertyId, isAuthenticated]);

  const handlePrefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['land', propertyId],
      queryFn: async () => {
        const { api } = await import("@/services/api");
        const res = await api.get(`/land/${propertyId}?prefetch=true`);
        return res.data;
      },
      staleTime: 60 * 1000
    });
  }, [queryClient, propertyId]);

  const getLandTypeIcon = (type: string) => {
    switch (type) {
      case "Nanjai": return "🌾";
      case "Punjai": return "🌵";
      case "Residential": return "🏡";
      case "Commercial": return "🏢";
      case "Agricultural": return "🌱";
      case "Industrial": return "🏭";
      default: return "📍";
    }
  };

  return (
    <>
      <div 
        onClick={handleNavigate}
        onMouseEnter={handlePrefetch}
        className="group block h-full cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none"
      >
      <div className="premium-card h-full flex flex-col relative group/card">
        
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleToggleWishlist}
            disabled={isWishlisting}
            className={`w-10 h-10 rounded-xl bg-[var(--surface)]/95 flex items-center justify-center hover:bg-[var(--surface)] transition-all shadow-md border border-[var(--ui-border)] group/heart active:scale-90 ${isWishlisting ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Add to Wishlist"
          >
            <Heart
              className={`w-4.5 h-4.5 transition-colors duration-500 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/heart:text-red-500"
              }`}
            />
          </button>
          
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-xl bg-[var(--surface)]/95 flex items-center justify-center hover:bg-[var(--surface)] transition-all shadow-md border border-[var(--ui-border)] group/share active:scale-90"
            aria-label="Share Property"
          >
            <Share2 className="w-4.5 h-4.5 text-[var(--text-secondary)] group-hover/share:text-brand-primary transition-colors duration-300" />
          </button>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100/50 rounded-t-3xl">
          {/* Top-left: NEW badge or time-on-market */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {isNewListing ? (
              <span className="badge-new">✦ New</span>
            ) : (
              <span className="px-2.5 py-1 bg-black/70 rounded-lg text-[10px] font-bold text-white shadow-md">
                {getTimeOnMarket(property.createdAt as string)}
              </span>
            )}
          </div>
          {/* Bottom-left: Photo count */}
          {imageCount > 1 && (
            <div className="absolute bottom-4 left-4 z-10 img-count-badge">
              <Camera className="w-3 h-3" />
              {imageCount} Photos
            </div>
          )}
          {mainImage ? (
            <Image
              src={mainImage}
              alt={property.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 ease-out md:group-hover/card:scale-105"
              sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 400px"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--surface-elevated)]">
              <ImageOff className="w-8 h-8 text-[var(--text-secondary)]" />
              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{t("home.noResults")}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-20 group-hover/card:opacity-40 transition-opacity duration-300 pointer-events-none" />
          
          <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0 hidden md:block">
            <div className="w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center shadow-lg border border-gray-100">
              <Maximize2 className="w-4.5 h-4.5 text-brand-primary" />
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-[var(--text-main)] text-lg leading-snug line-clamp-2 mb-2 group-hover/card:text-brand-primary transition-colors duration-200 tracking-tight">
            {property.title}
          </h3>

          {property.owner && (
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/profile/${property.owner._id || property.owner}`;
              }}
              className="flex items-center gap-2.5 mb-3.5 group/owner cursor-pointer w-fit active:opacity-70 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-brand-primary/5 border border-brand-primary/10 overflow-hidden relative flex-shrink-0 shadow-sm ring-2 ring-white group-hover/owner:border-brand-primary/30 transition-all duration-300">
                {property.owner.profileImage ? (
                  <Image src={property.owner.profileImage} alt={property.owner.name} fill sizes="28px" className="object-cover group-hover/owner:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-extrabold text-brand-primary bg-gradient-to-br from-brand-primary/10 to-brand-primary/5">
                    {property.owner.name?.[0] || 'O'}
                  </div>
                )}
              </div>
              <span className="text-[12px] font-bold text-text-secondary group-hover/owner:text-brand-primary transition-colors truncate max-w-[140px] tracking-tight">
                {property.owner.name}
              </span>
            </div>
          )}

          {property.landType && (
            <div className="flex mb-3">
              <span className="px-2.5 py-1 bg-brand-primary/[0.04] text-brand-primary/80 text-[12px] font-bold rounded-full flex items-center gap-1.5 border border-brand-primary/10">
                <span>{getLandTypeIcon(property.landType)}</span>
                {property.landType} {t("property.landType")}
              </span>
            </div>
          )}
          
          <button 
            title="View on Map"
            onClick={handleOpenMap}
            className="flex items-center text-text-secondary text-sm mb-4 hover:text-brand-primary transition-colors text-left w-full group/location z-10 relative active:opacity-70"
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-primary flex-shrink-0 group-hover/location:scale-110 transition-transform" />
            <span className="truncate font-medium">{location}</span>
          </button>

          {(property.reviewCount! > 0 || property.averageRating! > 0) && (
            <div className="flex items-center gap-1.5 mb-4 bg-amber-50 w-fit px-2 py-0.5 rounded-lg border border-amber-100/50">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-text-main">{property.averageRating!.toFixed(1)}</span>
              <span className="text-[10px] text-text-secondary">({property.reviewCount})</span>
            </div>
          )}

          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {sizeDisplay && (
                <span className="px-2.5 py-1 bg-[var(--surface-elevated)] text-[10px] font-bold tracking-wider uppercase rounded-lg text-[var(--text-secondary)] border border-[var(--ui-border)]">
                  {sizeDisplay}
                </span>
              )}
              {property.status && (
                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-lg border ${
                  property.status === "Available" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-orange-50 text-orange-600 border-orange-100"
                }`}>
                  {property.status === "Available" ? t("property.available") : t("property.sold")}
                </span>
              )}
              <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-lg border ${
                property.listingType === "rent" ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
              }`}>
                {categoryLabel} for {property.listingType === "rent" ? "Rent" : "Sale"}
              </span>
            </div>
            
            <div className="premium-divider" />
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100/50 mt-4 h-12">
              <div className="flex-1 min-w-0 pr-1">
                <p className="font-black text-xl sm:text-[22px] text-[var(--text-main)] flex items-baseline leading-tight truncate tracking-tight">
                  <span className="truncate">
                    {formatCurrency(property.listingType === "rent" ? (property.rentPerMonth || 0) : (property.price || 0))}
                  </span>
                  {property.listingType === "rent" && (
                    <span className="text-[10px] font-bold text-gray-500 ml-1 lowercase tracking-normal">/ mo</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleToggleCompare}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 border shadow-sm active:scale-95 ${
                    isCompared 
                      ? "bg-brand-primary text-white border-brand-primary shadow-brand-primary/20" 
                      : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--ui-border)] hover:border-brand-primary hover:text-brand-primary"
                  }`}
                >
                  <BarChart2 className={`w-3.5 h-3.5 ${isCompared ? "text-white" : "text-brand-primary"}`} />
                  <span className="hidden sm:inline-block">{isCompared ? "Added" : "Compare"}</span>
                </button>
                <div className="min-h-[44px] flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-brand-primary/5 text-brand-primary text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all duration-300 border border-brand-primary/10 hover:border-brand-primary shadow-sm hover:shadow-md active:scale-95">
                  {t("common.view")}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

    <MapModal
      isOpen={isMapOpen}
      onClose={() => setIsMapOpen(false)}
      locationName={location}
      lat={property.latitude || property.lat}
      lng={property.longitude || property.lng}
    />
    </>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
