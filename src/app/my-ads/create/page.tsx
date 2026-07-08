"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, X, PlusCircle, Phone, MapPin, Tag, FileText, DollarSign, Camera, Home, Landmark, Store } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MapLocationPicker from "@/components/MapLocationPicker";
import { useQueryClient } from "@tanstack/react-query";

/* ─────────────────────────────────────────────
   Section Card wrapper — every form group lives
   inside one of these clean, rounded cards.
   ───────────────────────────────────────────── */
function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6 transition-all duration-300 hover:shadow-[0_4px_28px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-[18px] h-[18px] text-brand-primary" />
        </div>
        <h2 className="text-[15px] font-bold text-text-main tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function CreateAdPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    size: "",
    sizeUnit: "sq ft",
    state: "",
    district: "",
    town: "",
    phone: "",
    type: "Land",
    landType: "",
    status: "Available",
    description: "",
    lat: null as number | null,
    lng: null as number | null,
    listingType: "sale",
    propertyCategory: "land",
    rentPerMonth: "",
    advance: "",
  });

  const set = (key: string, value: any) => {
    setFormData((p) => {
      const newState = { ...p, [key]: value };
      // Keep propertyCategory and generic Type in sync
      if (key === "propertyCategory") {
        if (value === "land") newState.type = "Land";
        if (value === "house") newState.type = "House";
        if (value === "shop") newState.type = "Plot";
      }
      return newState;
    });
  };

  /* ── File handling ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 5) {
        toast.error("Maximum 5 images allowed");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files]);
      setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  /* ── Validation ── */
  const validateForm = () => {
    if (!formData.title.trim()) { toast.error("Title is required"); return false; }
    if (formData.listingType === "sale" && (!formData.price || Number(formData.price) <= 0)) { toast.error("Please enter a valid price"); return false; }
    if (formData.listingType === "rent" && (!formData.rentPerMonth || Number(formData.rentPerMonth) <= 0)) { toast.error("Please enter a valid monthly rent"); return false; }
    if (!formData.size || Number(formData.size) <= 0) { toast.error("Please enter a valid size"); return false; }
    if (!formData.phone || formData.phone.length < 10) { toast.error("Please enter a valid 10-digit phone number"); return false; }
    if (!formData.state.trim()) { toast.error("State is required"); return false; }
    if (!formData.district.trim()) { toast.error("District is required"); return false; }
    if (!formData.town.trim()) { toast.error("Area/Town is required"); return false; }
    if (!formData.description.trim()) { toast.error("Description is required"); return false; }
    if (selectedFiles.length === 0) { toast.error("Please upload at least one image"); return false; }
    return true;
  };

  const [submissionStatus, setSubmissionStatus] = useState<"optimizing" | "uploading" | "finalizing" | "idle">("idle");

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmissionStatus("optimizing");

    const { compressImage } = await import("@/lib/imageCompression");

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("size", formData.size);
      data.append("sizeUnit", formData.sizeUnit);
      data.append("state", formData.state.trim());
      data.append("district", formData.district.trim());
      data.append("town", formData.town.trim());
      data.append("area", formData.town.trim());
      data.append("ownerPhone", formData.phone.trim());
      data.append("type", formData.type);
      data.append("landType", formData.landType);
      data.append("status", formData.status);
      data.append("listingType", formData.listingType);
      data.append("propertyCategory", formData.propertyCategory);

      if (formData.listingType === "sale") {
        data.append("price", formData.price);
      } else {
        data.append("rentPerMonth", formData.rentPerMonth);
        if (formData.advance) data.append("advance", formData.advance);
      }

      if (formData.lat && formData.lng) {
        data.append("lat", formData.lat.toString());
        data.append("lng", formData.lng.toString());
      }

      // Compress and append images
      for (let i = 0; i < selectedFiles.length; i++) {
        const compressedBlob = await compressImage(selectedFiles[i]);
        data.append("images", compressedBlob, `image_${i}.jpg`);
      }

      setSubmissionStatus("uploading");
      const res = await api.post("/land", data);
      
      setSubmissionStatus("finalizing");
      setIsSuccess(true);
      toast.success("Listing published successfully!");
      
      // Invalidate caches to ensure new data appears
      queryClient.invalidateQueries({ queryKey: ['lands'] });
      queryClient.invalidateQueries({ queryKey: ['trending-properties'] });
      queryClient.invalidateQueries({ queryKey: ['my-lands'] });
      
      // Auto redirect after short delay
      setTimeout(() => {
         router.push("/my-ads");
      }, 1500);
      
    } catch (error: any) {
      console.error("❌ SUBMISSION_ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to post ad.");
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus("idle");
    }
  };

  /* ── Reusable Input ── */
  const inputCls = "w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/10 hover:border-gray-300";
  const labelCls = "text-[13px] font-semibold text-text-main ml-0.5";

  /* ═══════════════════════════════════════════
     SUCCESS STATE
     ═══════════════════════════════════════════ */
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-lg flex flex-col items-center justify-center text-center page-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-8">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-3 tracking-tight">Listing Published!</h1>
        <p className="text-text-secondary mb-10 font-medium leading-relaxed max-w-sm">
          Your property is now live and visible to thousands of potential buyers on our marketplace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/my-ads" className="flex-1 px-6 py-3.5 bg-white border border-gray-200 rounded-xl font-bold text-text-main hover:bg-gray-50 transition-all text-center text-sm">
            Manage Ads
          </Link>
          <Link href="/" className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-center text-sm shadow-lg shadow-brand-primary/20 hover:shadow-xl transition-all">
            Marketplace
          </Link>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     MAIN FORM
     ═══════════════════════════════════════════ */
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 max-w-3xl page-fade-in">
      <Link href="/my-ads" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-text-main mb-2 tracking-tight">Post Your Property</h1>
        <p className="text-text-secondary font-medium">Detailed listings get 3× more inquiries. Fill out all sections below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══════════════════════════════════════
           SECTION 1 — BASIC DETAILS
           ═══════════════════════════════════════ */}
        <SectionCard icon={FileText} title="Basic Details">
          <div className="space-y-1.5">
            <label className={labelCls}>Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={
                formData.propertyCategory === "land" ? "Ex: Prime 2-Acre Residential Plot in Chennai" : 
                formData.propertyCategory === "shop" ? "Ex: Premium 500 sq ft Commercial Shop in T. Nagar" :
                "Ex: Beautiful 3BHK Villa in Adyar"
              }
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Description <span className="text-red-500">*</span></label>
            <textarea
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Describe key features, registration status, neighborhood..."
              className={`${inputCls} min-h-[120px] resize-none`}
            />
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════
           SECTION 2 — PROPERTY INFO
           ═══════════════════════════════════════ */}
        <SectionCard icon={Tag} title="Property Info">
          {/* Listing Type Toggle */}
          <div className="space-y-2">
            <label className={labelCls}>Listing Type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set("listingType", "sale")}
                className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border active:scale-[0.97] ${formData.listingType === "sale" ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}
              >
                For Sale
              </button>
              <button
                type="button"
                onClick={() => set("listingType", "rent")}
                className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border active:scale-[0.97] ${formData.listingType === "rent" ? "bg-brand-secondary text-white border-brand-secondary shadow-md shadow-brand-secondary/20" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}
              >
                For Rent
              </button>
            </div>
          </div>

          {/* Property Category Toggle */}
          <div className="space-y-2">
            <label className={labelCls}>Property Category <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => set("propertyCategory", "land")}
                className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-2 active:scale-[0.97] ${formData.propertyCategory === "land" ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}
              >
                <Landmark className="w-4 h-4" /> Land / Plot
              </button>
              <button
                type="button"
                onClick={() => set("propertyCategory", "house")}
                className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-2 active:scale-[0.97] ${formData.propertyCategory === "house" ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}
              >
                <Home className="w-4 h-4" /> House / Villa
              </button>
              <button
                type="button"
                onClick={() => set("propertyCategory", "shop")}
                className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-2 active:scale-[0.97] ${formData.propertyCategory === "shop" ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}
              >
                <Store className="w-4 h-4" /> Shop / Store
              </button>
            </div>
          </div>

          {/* Property Type & Land Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Property Type</label>
              <select value={formData.type} onChange={(e) => set("type", e.target.value)} className={`${inputCls} bg-gray-50`}>
                <option value="Land">Land / Plot</option>
                <option value="House">House / Villa</option>
                <option value="Plot">Commercial Plot</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Land Type <span className="text-text-secondary font-normal text-xs">(Optional)</span></label>
              <select value={formData.landType} onChange={(e) => set("landType", e.target.value)} className={`${inputCls} bg-gray-50`}>
                <option value="">Select Type</option>
                <option value="Nanjai">Nanjai</option>
                <option value="Punjai">Punjai</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Industrial">Industrial</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════
           SECTION 3 — LOCATION
           ═══════════════════════════════════════ */}
        <SectionCard icon={MapPin} title="Location">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>State <span className="text-red-500">*</span></label>
              <input type="text" value={formData.state} onChange={(e) => set("state", e.target.value)} placeholder="Tamil Nadu" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>District <span className="text-red-500">*</span></label>
              <input type="text" value={formData.district} onChange={(e) => set("district", e.target.value)} placeholder="Chennai" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Area / Town <span className="text-red-500">*</span></label>
              <input type="text" value={formData.town} onChange={(e) => set("town", e.target.value)} placeholder="Adyar" className={inputCls} />
            </div>
          </div>

          {/* Map */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className={labelCls}>
                Pin on Map <span className="text-brand-primary text-xs font-medium">(Recommended)</span>
              </label>
              {formData.lat && formData.lng && (
                <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">📍 Location Pinned</span>
              )}
            </div>
            <MapLocationPicker lat={formData.lat} lng={formData.lng} onChange={(lat, lng) => setFormData({ ...formData, lat, lng })} />
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════
           SECTION 4 — SIZE & PRICE
           ═══════════════════════════════════════ */}
        <SectionCard icon={DollarSign} title="Size & Pricing">
          {/* Size */}
          <div className="space-y-1.5">
            <label className={labelCls}>Total Size <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              <input
                type="number"
                value={formData.size}
                onChange={(e) => set("size", e.target.value)}
                placeholder="Enter land size"
                className={`${inputCls} flex-[3] min-w-0 ${!formData.size ? "border-orange-200 bg-orange-50/10" : ""}`}
              />
              <select 
                value={formData.sizeUnit} 
                onChange={(e) => set("sizeUnit", e.target.value)} 
                className={`${inputCls.replace('w-full', 'w-32')} bg-gray-50 cursor-pointer`}
              >
                <option value="sq ft">sq ft</option>
                <option value="acres">acres</option>
                <option value="cents">cents</option>
                <option value="sqm">sq m</option>
              </select>
            </div>
            {formData.size && formData.sizeUnit !== "sq ft" && (
              <p className="text-[11px] font-bold text-brand-primary ml-1 mt-1">
                ≈{" "}
                {(formData.sizeUnit === "acres"
                  ? Number(formData.size) * 43560
                  : formData.sizeUnit === "cents"
                    ? Number(formData.size) * 435.6
                    : Number(formData.size) * 10.7639
                ).toLocaleString()}{" "}
                sq ft
              </p>
            )}
          </div>

          {/* Price — conditional */}
          {formData.listingType === "sale" ? (
            <div className="space-y-1.5">
              <label className={labelCls}>Asking Price (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                <input type="number" value={formData.price} onChange={(e) => set("price", e.target.value)} placeholder="50,00,000" className={`${inputCls} pl-9`} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Rent / Month (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input type="number" value={formData.rentPerMonth} onChange={(e) => set("rentPerMonth", e.target.value)} placeholder="15,000" className={`${inputCls} pl-9`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Advance Deposit (₹) <span className="text-text-secondary font-normal text-xs">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input type="number" value={formData.advance} onChange={(e) => set("advance", e.target.value)} placeholder="50,000" className={`${inputCls} pl-9`} />
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <label className={labelCls}>Listing Status</label>
            <div className="grid grid-cols-2 gap-3">
              {["Available", "Sold"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("status", opt)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border active:scale-[0.97] ${
                    formData.status === opt
                      ? opt === "Available"
                        ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20"
                        : "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                      : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════
           SECTION 5 — MEDIA
           ═══════════════════════════════════════ */}
        <SectionCard icon={Camera} title="Photos">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary font-medium">Upload up to 5 images</p>
            <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg">{previews.length} / 5</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-100">
                <Image src={preview} alt="Preview" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-primary text-white text-[8px] font-black uppercase rounded-md shadow z-10">Cover</div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-2 bg-white text-red-500 rounded-xl shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-50 active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {previews.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-brand-primary", "bg-brand-primary/5"); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-brand-primary", "bg-brand-primary/5"); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-brand-primary", "bg-brand-primary/5");
                  if (e.dataTransfer.files) {
                    const mockEvent = { target: { files: e.dataTransfer.files } } as any;
                    handleFileChange(mockEvent);
                  }
                }}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-brand-primary/5 hover:border-brand-primary transition-all text-text-secondary hover:text-brand-primary group active:scale-[0.97]"
              >
                <PlusCircle className="w-7 h-7 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add</span>
              </button>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
        </SectionCard>

        {/* ═══════════════════════════════════════
           SECTION 6 — CONTACT
           ═══════════════════════════════════════ */}
        <SectionCard icon={Phone} title="Contact Information">
          <div className="space-y-1.5">
            <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={10}
                placeholder="9876543210"
                className={`${inputCls} pl-11`}
              />
            </div>
            <p className="text-[11px] text-text-secondary ml-1">This number will be visible to interested buyers.</p>
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════
           SUBMIT
           ═══════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-4">
          <p className="text-xs text-text-secondary font-medium max-w-sm text-center sm:text-left">
            By publishing, you agree to our Terms of Service and guarantee the accuracy of this listing.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-12 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {submissionStatus === "optimizing" ? "Optimizing Photos..." : 
                 submissionStatus === "uploading" ? "Uploading Listing..." : 
                 "Finalizing..."}
              </>
            ) : (
              "Publish Listing"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
