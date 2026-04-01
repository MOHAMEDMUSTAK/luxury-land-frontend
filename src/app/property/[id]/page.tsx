"use client";

import dynamic from "next/dynamic";
import { use, useState, useEffect, useMemo } from "react";
import { formatCurrency, getTimeOnMarket } from "@/lib/utils";
import ImageGallery from "@/components/ImageGallery";
const ChatBox = dynamic(() => import("@/components/ChatBox"), { ssr: false });
const MapModal = dynamic(() => import("@/components/MapModal"), { ssr: false });
import { MapPin, CheckCircle2, Phone, MessageCircle, Heart, Share2, Ruler, Loader2, Tag, ShieldCheck, ImageOff, Calendar, User, Sparkles, TrendingUp, Navigation, Landmark, Eye, Clock, Edit2, Trash2, BarChart2, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ProtectedRoute from "@/components/ProtectedRoute";
import RecentlyViewed from "@/components/RecentlyViewed";


export default function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const { id } = use(params);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const { hasItem, toggleItem } = useWishlistStore();
  const { properties, addProperty, removeProperty, isInCompare } = useCompareStore();
  const { user } = useAuthStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    api.get(`/land/${id}`).then(res => {
      setProperty(res.data?.data || res.data); // Support both paginated and flat response
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

    api.get(`/land/${id}/similar`).then(res => {
      setSimilarProperties(res.data);
    }).catch(err => console.error("Error fetching similar props:", err));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col justify-center items-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{t("common.loading")}</p>
      </div>
    );
  }

  if (!property) return notFound();

  const propertyId = property._id || property.id;
  const isWishlisted = hasItem(propertyId);

  // Use ONLY real uploaded images
  const hasImages = property.images && property.images.length > 0;

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-10 max-w-6xl page-fade-in scroll-smooth">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content (Left) */}
        <div className="lg:w-2/3 space-y-8">
          
          {/* Gallery */}
          <div className="rounded-[24px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-ui-border bg-gray-50 group/gallery">
            {hasImages ? (
              <ImageGallery images={property.images} />
            ) : (
              <div className="aspect-[16/10] md:aspect-[21/9] w-full bg-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3">
                <ImageOff className="w-12 h-12 text-gray-300" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Images Uploaded</p>
              </div>
            )}
          </div>

          {/* Title & Basics Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="pb-6 border-b border-ui-border"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  <span className="gradient-badge px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-lg">
                    {property.listingType || "Property asset"}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-text-secondary">
                    ID: {propertyId.slice(-6).toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-brand-primary/5 text-brand-primary border border-brand-primary/10 rounded-lg text-[10px] font-bold">
                    {getTimeOnMarket(property.createdAt)}
                  </span>
                  {property.averageRating > 0 && (
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-yellow-500" />
                      {property.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold gradient-heading leading-tight mb-3">
                  {property.title}
                </h1>
                <button 
                  onClick={() => setIsMapOpen(true)}
                  className="flex items-start text-text-secondary font-medium hover:text-brand-primary transition-colors text-left group mt-2"
                >
                  <MapPin className="w-4 h-4 mr-1.5 text-brand-primary group-hover:scale-110 transition-transform flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">{[...new Set([property.street, property.area, property.town, property.district, property.state].filter(Boolean))].join(', ') || property.location || "Location not available"}</span>
                </button>
              </div>
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      const shareUrl = window.location.href;
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: property.title,
                            text: `${property.title} - ${formatCurrency(property.price)}`,
                            url: shareUrl,
                          });
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            if (navigator.clipboard) {
                              await navigator.clipboard.writeText(shareUrl);
                              toast.success("Link copied to clipboard!");
                            }
                          }
                        }
                      } else {
                        if (navigator.clipboard) {
                          await navigator.clipboard.writeText(shareUrl);
                          toast.success("Link copied to clipboard!");
                        } else {
                          toast.error("Sharing not supported on this browser");
                        }
                      }
                    }}
                    className="w-12 h-12 flex items-center justify-center border border-ui-border rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:scale-110 active:scale-95 transition-all duration-300 text-text-secondary"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (isInCompare(propertyId)) {
                        removeProperty(propertyId);
                        toast("Removed from Compare", { icon: "📊" });
                      } else {
                        addProperty(property);
                      }
                    }}
                    className="w-12 h-12 flex items-center justify-center border-2 border-brand-primary/20 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-primary hover:scale-110 active:scale-95 transition-all duration-300 group/compare"
                    title={isInCompare(propertyId) ? "Remove from Compare" : "Add to Compare"}
                  >
                    <BarChart2 className={`w-5 h-5 transition-all duration-300 ${isInCompare(propertyId) ? "text-brand-primary scale-110" : "text-text-secondary group-hover/compare:text-brand-primary"}`} />
                  </button>
                  <button 
                    disabled={isWishlisting}
                    onClick={async () => {
                      if (!user) return toast.error("Please login to save");
                      setIsWishlisting(true);
                      try {
                        const propertyId = property._id || property.id;
                        const wasWishlisted = isWishlisted;
                        
                        // STRICT SYNC: Update based on real backend response
                        const newCount = await toggleItem(propertyId, user?.id);
                        
                        if (typeof newCount === 'number') {
                          setProperty((prev: any) => ({
                            ...prev,
                            wishlistCount: newCount
                          }));
                        }

                        if (!wasWishlisted) {
                          toast.success("Added to Wishlist");
                        } else {
                          toast("Removed from Wishlist", { icon: "ℹ️" });
                        }
                      } catch (err) {
                        toast.error("Failed to update wishlist");
                      } finally {
                        setIsWishlisting(false);
                      }
                    }}
                    className={`w-12 h-12 flex items-center justify-center border-2 border-red-500/20 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:border-red-500 hover:scale-110 active:scale-95 transition-all duration-300 group/heart ${isWishlisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart className={`w-5 h-5 transition-all duration-300 ${isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-text-secondary group-hover/heart:text-red-500"}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Specs Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
             {[
               { icon: Ruler, label: t("property.totalSize"), value: `${property.size} ${property.sizeUnit || 'sq ft'}` },
               { icon: Tag, label: t("property.assetType"), value: property.propertyCategory === "shop" ? "Shop" : property.type || "Land" },
               { icon: Sparkles, label: t("property.landType"), value: property.landType || "Standard", hide: !property.landType },
               { icon: MapPin, label: t("property.status"), value: property.status === "Sold" ? t("property.sold") : t("property.available"), color: property.status === "Sold" ? "text-red-600" : "text-green-600" },
             ].filter(spec => !spec.hide).slice(0, 4).map((spec, i) => (
                <div key={i} className="p-5 bg-white rounded-[20px] border border-ui-border flex flex-col items-center text-center hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 group/spec">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/[0.04] flex items-center justify-center mb-3 group-hover/spec:bg-brand-primary/10 transition-colors">
                    <spec.icon className="w-5 h-5 text-brand-primary transition-transform duration-500 group-hover/spec:scale-110" />
                  </div>
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1">{spec.label}</span>
                  <span className={`font-bold text-sm text-text-main ${spec.color || ""}`}>{spec.value}</span>
                </div>
             ))}
          </motion.div>

          {/* Property Details & Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl border border-ui-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            {/* Section Header */}
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-xl font-bold text-text-main border-l-4 border-brand-primary pl-4 tracking-tight">{t("property.details")}</h2>
            </div>

            {/* Description Body */}
            <div className="px-8 pb-6">
              <motion.p 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                transition={{ duration: 0.8 }}
                className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4"
              >
                Premium Opportunity — Perfect for your future investment
              </motion.p>
              <p className="text-text-secondary leading-[1.8] text-[15px]">{property.description}</p>
            </div>

            {/* Property Highlights Grid */}
            <div className="mx-8 mb-6 p-6 bg-gray-50/80 rounded-2xl border border-ui-border">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                {t("property.highlights")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                {[
                  { icon: Ruler, label: "Total Area", value: `${property.size} ${property.sizeUnit || 'sq ft'}` },
                  { icon: Tag, label: t("property.assetType"), value: (property.propertyCategory || property.type || "land").charAt(0).toUpperCase() + (property.propertyCategory || "land").slice(1) },
                  { icon: Sparkles, label: t("property.landType"), value: property.landType || "—" },
                  { icon: Landmark, label: "Listing Type", value: property.listingType === "rent" ? "For Rent" : "For Sale" },
                  { icon: MapPin, label: t("common.location"), value: property.town || property.area || "—" },
                  { icon: Navigation, label: "District", value: property.district || "—" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-ui-border flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-brand-primary/30 transition-colors">
                      <item.icon className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">{item.label}</p>
                      <p className="text-sm font-bold text-text-main leading-tight break-words">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info / Popularity */}
            <div className="mx-8 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: "Posted", value: property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently" },
                { icon: Eye, label: "Views", value: `${property.viewCount || property.views || 0} views` },
                { icon: Heart, label: "Interested", value: `${property.wishlistCount || 0} saved` },
                { icon: Clock, label: t("property.status"), value: property.status === "Sold" ? t("property.sold") : t("property.available"), color: property.status === "Sold" ? "text-red-600" : "text-green-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 bg-white border border-ui-border rounded-xl">
                  <item.icon className="w-4 h-4 text-brand-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{item.label}</p>
                    <p className={`text-xs font-bold text-text-main ${item.color || ""}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Why This Property (Smart Insights) */}
            <div className="mx-8 mb-8 p-6 bg-gradient-to-br from-brand-primary/[0.04] to-brand-primary/[0.08] rounded-2xl border border-brand-primary/10">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                {t("property.whyThis")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { text: `Prime location in ${property.town || property.district || 'a sought-after area'}`, highlight: true },
                  { text: `${property.size} ${property.sizeUnit || 'sq ft'} — ideal for ${property.propertyCategory === 'house' ? 'residential living' : property.propertyCategory === 'shop' ? 'commercial business' : 'investment or development'}`, highlight: false, icon: Sparkles },
                  property.propertyCategory === 'land' && property.size > 1000 ? { text: "High ROI potential for layout or cultivation", highlight: true, icon: TrendingUp } : null,
                  property.location ? { text: "Strategic connectivity near key infrastructure", highlight: false, icon: Navigation } : null,
                  { text: "Verified clear title with legal documentation", highlight: false, icon: ShieldCheck },
                  property.viewCount > 10 ? { text: "High demand property — trending among investors", highlight: true, icon: Eye } : null,
                ].filter(Boolean).map((point: any, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${point.highlight ? 'text-brand-primary' : 'text-brand-success'}`} />
                    <span className="text-sm text-text-secondary font-medium leading-relaxed">{point.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Features */}
            <div className="px-8 pb-8">
              <div className="flex items-center gap-6 flex-wrap">
                {[t("property.legalAudit"), t("property.registration"), t("property.primeLocation"), t("property.appreciation")].map((feat) => (
                  <div key={feat} className="flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
                    <span className="font-bold text-text-secondary">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar / Owner Panel (Right) */}
        <div className="lg:w-1/3">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="static lg:sticky lg:top-[100px] space-y-6"
          >
            <div className="bg-white border border-ui-border rounded-[24px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden relative group/owner flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary" />
              
              <div className="w-full mb-6 pb-6 border-b border-gray-100 flex flex-col items-center">
                <p className="text-[10px] font-bold text-text-secondary tracking-[0.2em] uppercase mb-2">{t("property.askingPrice") || "Asking Price"}</p>
                <div className="w-full text-center">
                  <p className="font-extrabold gradient-price leading-tight break-words w-full"
                    style={{
                      fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {formatCurrency(property.listingType === "rent" ? property.rentPerMonth : property.price)}
                    {property.listingType === "rent" && (
                      <span className="text-sm font-semibold text-text-secondary ml-1 lowercase tracking-normal">/ mth</span>
                    )}
                  </p>
                </div>
              </div>
              
              <h3 className="text-[10px] w-full text-left flex font-bold text-text-secondary tracking-[0.2em] uppercase mb-6">{t("property.listedBy")}</h3>
              
              <Link 
                href={`/profile/${property.owner?._id || property.owner}`} 
                className="flex items-center gap-4 mb-8 group/owner-link hover:bg-gray-50/50 p-2 -ml-2 rounded-2xl w-full text-left transition-all"
              >
                <div className="w-14 h-14 bg-white border border-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm group-hover/owner-link:border-brand-primary transition-all overflow-hidden relative">
                  {property.owner?.profileImage ? (
                    <Image src={property.owner.profileImage} alt={property.owner.name} fill className="object-cover" />
                  ) : (
                    property.owner?.name?.[0] || 'A'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 translate-y-[-1px]">
                    <p className="font-bold text-lg text-text-main group-hover/owner-link:text-brand-primary transition-colors">{property.owner?.name || "Ahmed R."}</p>
                    {property.owner?.isVerified && (
                      <span title="Verified Seller">
                        <ShieldCheck className="w-4 h-4 text-brand-primary fill-brand-primary/10" />
                      </span>
                    )}
                  </div>
                  {/* Response Speed Badge */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-brand-primary/5 text-brand-primary rounded border border-brand-primary/10 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {(() => {
                        const trt = property.owner?.totalResponseTime || 0;
                        const count = property.owner?.responseCount || 0;
                        if (count === 0) return "New Seller";
                        const avgSecs = (trt / count) / 1000;
                        if (avgSecs < 60) return "⚡ Fast Responder";
                        const avgMins = Math.floor(avgSecs / 60);
                        if (avgMins < 60) return `Responds in ${avgMins} mins`;
                        const avgHours = Math.floor(avgMins / 60);
                        return `Responds in ~${avgHours} hours`;
                      })()}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 mt-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${new Date().getTime() - new Date(property.owner?.lastActive || 0).getTime() < 15 * 60 * 1000 ? 'bg-brand-success' : 'bg-gray-300'}`} />
                    <span className={new Date().getTime() - new Date(property.owner?.lastActive || 0).getTime() < 15 * 60 * 1000 ? 'text-brand-success' : 'text-text-secondary'}>
                      {new Date().getTime() - new Date(property.owner?.lastActive || 0).getTime() < 15 * 60 * 1000 ? 'Active Now' : 'Recently Active'}
                    </span>
                  </div>
                </div>
              </Link>

              {(user?.id && (user.id === property.owner?._id || user.id === property.owner)) ? (
                <div className="space-y-3">
                  <Link 
                    href={`/edit-property/${propertyId}`}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 transition-all shadow-md active:scale-95"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Listing
                  </Link>
                  
                  <button 
                    onClick={async () => {
                      if (!global.confirm("Are you sure you want to delete this ad?")) return;
                      try {
                        const toastId = toast.loading("Deleting property...");
                        await api.delete(`/land/${propertyId}`);
                        toast.success("Listing deleted successfully", { id: toastId });
                        window.location.href = "/my-ads";
                      } catch (err) {
                        toast.error("Failed to delete property");
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-100 font-bold py-4 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 transition-all shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t("property.chat")}
                  </button>

                  <button 
                    onClick={() => {
                      if (isInCompare(propertyId)) {
                        removeProperty(propertyId);
                        toast("Removed from Compare", { icon: "📊" });
                      } else {
                        addProperty(property);
                        toast.success("Added to Compare!");
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all active:scale-95 border-2 ${isInCompare(propertyId) ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-white text-brand-primary border-brand-primary/20 hover:bg-brand-primary/5"}`}
                  >
                    <BarChart2 className="w-5 h-5" />
                    {isInCompare(propertyId) ? "In Comparison" : "Add to Compare"}
                  </button>

                  <button 
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full flex items-center justify-center gap-2 bg-white text-brand-primary border-2 border-brand-primary/10 font-bold py-4 rounded-xl hover:bg-brand-primary/5 transition-all active:scale-95"
                  >
                    <Phone className="w-5 h-5" />
                    {showPhone ? property.ownerPhone || "9876543210" : t("property.showPhone")}
                  </button>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-ui-border text-center">
                <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                  Protect yourself from scams
                </p>
              </div>
            </div>

            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6">
               <h4 className="font-bold text-text-main mb-2">Interested in this land?</h4>
               <p className="text-xs text-text-secondary leading-relaxed">
                 Start a real-time conversation or request a call-back for immediate details. Marketplace safety rules apply.
               </p>
            </div>
          </motion.div>
        </div>
      </div>

      <ChatBox 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        receiverName={property.owner?.name || "Ahmed R."}
        receiverId={property.owner?._id || property.owner} 
        landId={propertyId}
        initialPrice={property.listingType === "rent" ? property.rentPerMonth : property.price}
      />

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        locationName={[...new Set([property.street, property.area, property.town, property.district, property.state].filter(Boolean))].join(', ') || property.location || "Location Area"}
        lat={property.latitude || property.lat}
        lng={property.longitude || property.lng}
      />

      {/* Review Section */}
      <div className="mt-12 pt-12 border-t border-ui-border max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-main mb-2">User Reviews</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(property.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-text-main">{property.averageRating?.toFixed(1) || "0.0"}</span>
              <span className="text-sm text-text-secondary">• {property.reviewCount || 0} verified reviews</span>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button 
              onClick={() => {
                if (!user) return toast.error("Please login to review");
                document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white border border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary/[0.02] transition-all text-sm"
            >
              Write a Review
            </button>
          </motion.div>
        </div>

        {/* Review Form */}
        {user && (
          <motion.div 
            id="review-form"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gray-50/50 rounded-[24px] p-8 border border-ui-border mb-12"
          >
            <h3 className="text-lg font-bold text-text-main mb-6">How was your experience?</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] block mb-3">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.2 }}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          s <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`} 
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] block mb-3">Your Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the property, location, and connectivity..."
                  className="w-full bg-white border border-ui-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none min-h-[120px] shadow-sm"
                />
              </div>
              <button
                disabled={submittingReview || !rating || !comment}
                onClick={async () => {
                  setSubmittingReview(true);
                  try {
                    await api.post(`/land/${propertyId}/reviews`, { rating, comment });
                    toast.success("Review submitted! Thank you for your feedback.");
                    setRating(0);
                    setComment("");
                    // Refresh data
                    const res = await api.get(`/land/${id}`);
                    setProperty(res.data);
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || "Failed to submit review");
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                className="bg-brand-primary text-white font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-brand-primary/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Review List */}
        <div className="space-y-6">
          {property.reviews && property.reviews.length > 0 ? (
            property.reviews.slice().reverse().map((rev: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-ui-border shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center font-bold text-brand-primary border border-brand-primary/10">
                      {rev.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-main text-sm">{rev.user?.name || "Verified User"}</h4>
                      <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{rev.comment}</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Be the first to review this property</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <div className="mt-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-main mb-2">Similar Properties</h2>
              <p className="text-sm text-text-secondary">Based on location and category in {property.town || property.district}</p>
            </div>
            <Link href="/marketplace" className="text-sm font-bold text-brand-primary hover:underline underline-offset-4">Browse More</Link>
          </div>
          
          <div className="flex overflow-x-auto pb-8 gap-6 no-scrollbar -mx-4 px-4 scroll-smooth">
            {similarProperties.map((sim, i) => (
              <div key={i} className="min-w-[300px] md:min-w-[350px]">
                <Link href={`/property/${sim._id}`} className="block group/sim">
                  <div className="bg-white rounded-3xl border border-ui-border overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image 
                        src={sim.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fee74a62"} 
                        alt={sim.title} 
                        fill 
                        className="object-cover group-hover/sim:scale-110 transition-transform duration-[1200ms]" 
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-brand-primary shadow-lg border border-white/50">
                        {formatCurrency(sim.price || sim.rentPerMonth)}
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-text-main group-hover/sim:text-brand-primary transition-colors text-base truncate mb-2">{sim.title}</h4>
                      <div className="flex items-center text-text-secondary text-xs">
                        <MapPin className="w-3 h-3 mr-1 text-brand-primary" />
                        <span className="truncate">{sim.town}, {sim.district}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- RECENTLY VIEWED (NEW) --- */}
      <RecentlyViewed activeCategory={property?.propertyCategory} />
    </div>
    </ProtectedRoute>
  );
}
