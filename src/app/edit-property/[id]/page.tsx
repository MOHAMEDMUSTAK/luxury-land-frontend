"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, X, PlusCircle, Phone, MapPin, Tag, FileText, DollarSign, Camera, Home, Landmark, Save, Store } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";

/* Section Card */
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

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    listingType: "sale",
    propertyCategory: "land",
    rentPerMonth: "",
    advance: "",
  });

  const set = (key: string, value: string) => setFormData((p) => ({ ...p, [key]: value }));
  const inputCls = "w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/10 hover:border-gray-300";
  const labelCls = "text-[13px] font-semibold text-text-main ml-0.5";

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await api.get(`/land/${id}`);
        const land = res.data;
        const ownerId = land.owner?._id || land.owner;
        
        // Authorization check
        if (!user || user.id !== ownerId) {
          toast.error("You are not authorized to edit this listing.");
          router.replace("/");
          return;
        }
        
        setIsAuthorized(true);
        setFormData({
          title: land.title || "",
          price: String(land.price || ""),
          size: String(land.size || ""),
          sizeUnit: land.sizeUnit || "sq ft",
          state: land.state || "",
          district: land.district || "",
          town: land.town || land.area || "",
          phone: land.ownerPhone || "",
          type: land.type || "Land",
          landType: land.landType || "",
          status: land.status || "Available",
          description: land.description || "",
          listingType: land.listingType || "sale",
          propertyCategory: land.propertyCategory || "land",
          rentPerMonth: String(land.rentPerMonth || ""),
          advance: String(land.advance || ""),
        });
        setExistingImages(land.images || []);
      } catch (error) {
        toast.error("Failed to load listing");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user !== undefined) {
      // Don't fetch until we know who the local user is
      fetchLand();
    }
  }, [id, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (existingImages.length + selectedFiles.length + files.length > 5) {
        toast.error("Maximum 5 images allowed");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files]);
      setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const validateForm = () => {
    if (!formData.title.trim()) { toast.error("Title is required"); return false; }
    if (formData.listingType === "sale" && (!formData.price || Number(formData.price) <= 0)) { toast.error("Please enter a valid price"); return false; }
    if (formData.listingType === "rent" && (!formData.rentPerMonth || Number(formData.rentPerMonth) <= 0)) { toast.error("Please enter a valid monthly rent"); return false; }
    if (!formData.size || Number(formData.size) <= 0) { toast.error("Please enter a valid size"); return false; }
    if (!formData.phone || formData.phone.length < 10) { toast.error("Please enter a valid phone number"); return false; }
    if (!formData.state.trim()) { toast.error("State is required"); return false; }
    if (!formData.district.trim()) { toast.error("District is required"); return false; }
    if (!formData.town.trim()) { toast.error("Area/Town is required"); return false; }
    if (!formData.description.trim()) { toast.error("Description is required"); return false; }
    if (existingImages.length === 0 && selectedFiles.length === 0) { toast.error("At least one image is required"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

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

      data.append("existingImages", JSON.stringify(existingImages));
      selectedFiles.forEach((file) => data.append("images", file));

      // As per backend convention, our route maps to /land
      await api.put(`/land/${id}`, data);
      toast.success("Listing updated successfully!");
      router.push("/my-ads");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCount = existingImages.length + newPreviews.length;

  if (isLoading || !isAuthorized) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-brand-primary rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-3xl page-fade-in">
        <Link href="/my-ads" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-text-main mb-2 tracking-tight">Edit Listing</h1>
          <p className="text-text-secondary font-medium">Update your property details. Changes reflect immediately.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1 — BASIC DETAILS */}
          <SectionCard icon={FileText} title="Basic Details">
            <div className="space-y-1.5">
              <label className={labelCls}>Title <span className="text-red-500">*</span></label>
              <input type="text" value={formData.title} onChange={(e) => set("title", e.target.value)} placeholder="Property title" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Description <span className="text-red-500">*</span></label>
              <textarea value={formData.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Describe key features..." className={`${inputCls} min-h-[120px] resize-none`} />
            </div>
          </SectionCard>

          {/* SECTION 2 — PROPERTY INFO */}
          <SectionCard icon={Tag} title="Property Info">
            <div className="space-y-2">
              <label className={labelCls}>Listing Type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => set("listingType", "sale")} className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border active:scale-[0.97] ${formData.listingType === "sale" ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}>For Sale</button>
                <button type="button" onClick={() => set("listingType", "rent")} className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border active:scale-[0.97] ${formData.listingType === "rent" ? "bg-brand-secondary text-white border-brand-secondary shadow-md shadow-brand-secondary/20" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}>For Rent</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Property Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button type="button" onClick={() => set("propertyCategory", "land")} className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-2 active:scale-[0.97] ${formData.propertyCategory === "land" ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}><Landmark className="w-4 h-4" /> Land / Plot</button>
                <button type="button" onClick={() => set("propertyCategory", "house")} className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-2 active:scale-[0.97] ${formData.propertyCategory === "house" ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}><Home className="w-4 h-4" /> House / Villa</button>
                <button type="button" onClick={() => set("propertyCategory", "shop")} className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center justify-center gap-2 active:scale-[0.97] ${formData.propertyCategory === "shop" ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}><Store className="w-4 h-4" /> Shop / Store</button>
              </div>
            </div>
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

          {/* SECTION 3 — LOCATION */}
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
          </SectionCard>

          {/* SECTION 4 — SIZE & PRICE */}
          <SectionCard icon={DollarSign} title="Size & Pricing">
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
            </div>

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
                  <label className={labelCls}>Advance (₹) <span className="text-text-secondary font-normal text-xs">(Optional)</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                    <input type="number" value={formData.advance} onChange={(e) => set("advance", e.target.value)} placeholder="50,000" className={`${inputCls} pl-9`} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={labelCls}>Listing Status</label>
              <div className="grid grid-cols-2 gap-3">
                {["Available", "Sold"].map((opt) => (
                  <button key={opt} type="button" onClick={() => set("status", opt)} className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border active:scale-[0.97] ${formData.status === opt ? (opt === "Available" ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20" : "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20") : "bg-gray-50 text-text-secondary border-gray-200 hover:bg-gray-100"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* SECTION 5 — PHOTOS */}
          <SectionCard icon={Camera} title="Photos">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary font-medium">Upload up to 5 images</p>
              <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg">{totalCount} / 5</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {existingImages.map((img, index) => (
                <div key={`e-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-100">
                  <Image src={img} alt="Existing" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  {index === 0 && newPreviews.length === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-primary text-white text-[8px] font-black uppercase rounded-md shadow z-10">Cover</div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button type="button" onClick={() => removeExistingImage(index)} className="p-2 bg-white text-red-500 rounded-xl shadow-lg hover:bg-red-50 active:scale-90 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {newPreviews.map((preview, index) => (
                <div key={`n-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-200 group bg-gray-100">
                  <Image src={preview} alt="New" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[8px] font-black uppercase rounded-md shadow z-10">New</div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button type="button" onClick={() => removeNewFile(index)} className="p-2 bg-white text-red-500 rounded-xl shadow-lg hover:bg-red-50 active:scale-90 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {totalCount < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-brand-primary/5 hover:border-brand-primary transition-all text-text-secondary hover:text-brand-primary group active:scale-[0.97]">
                  <PlusCircle className="w-7 h-7 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
          </SectionCard>

          {/* SECTION 6 — CONTACT */}
          <SectionCard icon={Phone} title="Contact Information">
            <div className="space-y-1.5">
              <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)} maxLength={10} placeholder="9876543210" className={`${inputCls} pl-11`} />
              </div>
            </div>
          </SectionCard>

          {/* SUBMIT */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-4">
            <p className="text-xs text-text-secondary font-medium max-w-sm text-center sm:text-left">
              Changes will be reflected immediately across the marketplace.
            </p>
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-12 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3">
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
