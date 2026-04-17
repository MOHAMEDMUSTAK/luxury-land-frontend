"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from "react";
import { Filter, ChevronDown, Search, X, SlidersHorizontal, Store, Home as HomeIcon, Landmark, Check as CheckIcon } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { api } from "@/services/api";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import PropertySkeleton from "@/components/PropertySkeleton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useIntersectionObserver } from "@/lib/useIntersectionObserver";
import { useQueryClient } from "@tanstack/react-query";

const RecentlyViewed = dynamic(() => import("@/components/RecentlyViewed"), { 
  ssr: false,
  loading: () => <div className="h-40 animate-pulse bg-gray-50 rounded-3xl mt-12" />
});

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

function HomeContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const queryClient = useQueryClient();

  // Filter/Sort State
  const [activeSort, setActiveSort] = useState("latest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [sizeUnitFilter, setSizeUnitFilter] = useState("sq ft");
  const [landTypeFilter, setLandTypeFilter] = useState("");
  const [listingCategory, setListingCategory] = useState("Buy");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // IntersectionObserver for infinite scroll
  const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver({
    rootMargin: '400px',
  });

  const fetchProperties = useCallback(async (
    query: string, sort: string, filters: { minPrice: string; maxPrice: string; type: string; minSize: string; maxSize: string; sizeUnitFilter: string; landType: string; listingCategory: string },
    pageNumber: number = 1, append: boolean = false
  ) => {
    try {
      if (append) setIsFetchingMore(true);
      else setIsLoading(true);

      const params: any = { page: pageNumber, limit: 12 };
      
      if (query.trim()) {
        params.search = query.trim();
      }

      if (sort === "price-low-high") params.sortBy = "price_asc";
      else if (sort === "price-high-low") params.sortBy = "price_desc";
      else params.sortBy = "latest";

      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.type) params.type = filters.type;
      if (filters.minSize) params.minSize = filters.minSize;
      if (filters.maxSize) params.maxSize = filters.maxSize;
      params.sizeUnitFilter = filters.sizeUnitFilter;
      if (filters.landType) params.landType = filters.landType;
      
      params.listingType = filters.listingCategory === "Rent" ? "rent" : "sale";

      if (filters.type === "Land" || filters.type === "Plot") {
        params.propertyCategory = "land";
      } else if (filters.type === "House") {
        params.propertyCategory = "house";
      } else if (filters.type === "Shop") {
        params.propertyCategory = "shop";
      }

      const queryKey = ['lands', params];
      
      const rawData = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          const res = await api.get('/land', { params });
          return res.data;
        },
        staleTime: 60 * 1000 // Cache for 60 seconds
      });

      const serverData = rawData?.data || (Array.isArray(rawData) ? rawData : []);
      const serverPages = rawData?.pages || 1;
      const serverPage = rawData?.page || 1;

      if (append) {
        setProperties(prev => [...(Array.isArray(prev) ? prev : []), ...serverData]);
      } else {
        setProperties(serverData);
      }
      
      setTotalPages(serverPages);
      setPage(serverPage);
    } catch (error: any) {
      console.error("Failed to fetch lands:", error);
      if (!append) setProperties([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  const currentFilters = useCallback(() => ({
    minPrice, maxPrice, type: propertyType, minSize, maxSize, sizeUnitFilter, landType: landTypeFilter, listingCategory
  }), [minPrice, maxPrice, propertyType, minSize, maxSize, sizeUnitFilter, landTypeFilter, listingCategory]);

  const executeSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      fetchProperties(searchQuery, activeSort, currentFilters());
    }
  }, [searchQuery, activeSort, currentFilters, fetchProperties]);

  useEffect(() => {
    setSearchQuery(urlSearch);
    fetchProperties(urlSearch, activeSort, currentFilters());
    if (urlSearch.trim()) setIsSearchActive(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchProperties(searchQuery, activeSort, currentFilters(), 1, false);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, activeSort, minPrice, maxPrice, propertyType, minSize, maxSize, sizeUnitFilter, landTypeFilter, listingCategory, fetchProperties, currentFilters]);

  // Auto-load more with IntersectionObserver
  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !isFetchingMore) {
      fetchProperties(searchQuery, activeSort, currentFilters(), page + 1, true);
    }
  }, [page, totalPages, isFetchingMore, searchQuery, activeSort, currentFilters, fetchProperties]);

  useEffect(() => {
    if (isLoadMoreVisible && page < totalPages && !isFetchingMore && !isLoading) {
      handleLoadMore();
    }
  }, [isLoadMoreVisible, page, totalPages, isFetchingMore, isLoading, handleLoadMore]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchActive(false);
    fetchProperties("", activeSort, currentFilters());
  }, [activeSort, currentFilters, fetchProperties]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setIsSearchActive(false);
    setActiveSort("latest");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("");
    setMinSize("");
    setMaxSize("");
    setSizeUnitFilter("sq ft");
    setLandTypeFilter("");
    setListingCategory("Buy");
    setActiveChip(null);
    fetchProperties("", "latest", { minPrice: "", maxPrice: "", type: "", minSize: "", maxSize: "", sizeUnitFilter: "sq ft", landType: "", listingCategory: "Buy" });
  }, [fetchProperties]);

  const hasActiveFilters = !!(minPrice || maxPrice || propertyType || minSize || maxSize || searchQuery);

  const sortLabel = useMemo(() => {
    return activeSort === "price-low-high" ? t("home.sortBy") + ": Low → High" 
    : activeSort === "price-high-low" ? t("home.sortBy") + ": High → Low" 
    : t("home.sortBy") + ": Latest";
  }, [activeSort, t]);

  const chipOptions = useMemo(() => [
    { id: 'budget', label: 'Budget Friendly 💰', logic: () => { setMaxPrice("5000000"); setMinPrice(""); } },
    { id: 'farming', label: 'Best for Farming 🌾', logic: () => { setPropertyType("Land"); setLandTypeFilter("Agricultural"); setMinSize("1"); setSizeUnitFilter("acres"); } },
    { id: 'investment', label: 'High Investment 📈', logic: () => { setSearchQuery("City"); setPropertyType("Land"); } },
    { id: 'residential', label: 'Residential Plots 🏡', logic: () => { setPropertyType("Land"); setLandTypeFilter("Residential"); } },
  ], []);


  return (
    <>
      <div className="min-h-screen mb-20 page-fade-in relative">
        {/* 🌑 DARK CINEMATIC HERO SECTION */}
        <section className="hero-dark relative w-full min-h-[620px] flex items-center justify-center mb-16 pt-32 pb-24">
          {/* Grid pattern overlay */}
          <div className="hero-grid" />
          {/* Floating particles */}
          <div className="hero-particles" />
          
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
            <div className="animate-fade-in-up">
              <span className="inline-block py-1.5 px-5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] sm:text-xs font-black tracking-[0.3em] text-indigo-300 uppercase mb-8 backdrop-blur-md">
                The Pinnacle of Real Estate
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                Exclusive <br/>
                <span className="gradient-hero-text shimmer-effect inline-block">Landscapes</span>.
              </h1>
              <p className="text-white/50 text-sm sm:text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed px-2">
                Discover the world's most innovative high-end real estate platform. Find untouched lands and premium properties with an unparalleled user experience.
              </p>
            </div>

            {/* Search Section */}
            <div className="w-full max-w-3xl flex flex-col items-center px-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              
              {!isSearchActive ? (
                <div className="w-full flex flex-col items-center">
                    {/* Buy / Rent Toggle */}
                    <div className="relative flex bg-white/[0.06] backdrop-blur-md p-1.5 rounded-full mb-8 border border-white/10 scale-90 sm:scale-100">
                      <button 
                        onClick={() => setListingCategory("Buy")}
                        className={`relative z-10 px-8 py-2 rounded-full text-[10px] sm:text-sm font-black tracking-widest uppercase transition-all duration-300 ${listingCategory === "Buy" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                      >
                        Buy
                      </button>
                      <button 
                        onClick={() => setListingCategory("Rent")}
                        className={`relative z-10 px-8 py-2 rounded-full text-[10px] sm:text-sm font-black tracking-widest uppercase transition-all duration-300 ${listingCategory === "Rent" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                      >
                        Rent
                      </button>
                      <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full shadow-lg shadow-brand-primary/30 transition-all duration-500 ease-in-out ${listingCategory === 'Buy' ? 'left-1.5' : 'left-[calc(50%+4.5px)]'}`}/>
                    </div>

                    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-0">
                      <div className="w-full flex items-center bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-full p-1.5 sm:p-2 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:bg-white/[0.12] hover:border-white/15 group/hero-search overflow-hidden">
                        <div className="pl-4 sm:pl-5 flex-shrink-0">
                          <Search className="h-5 w-5 text-indigo-400/60 group-focus-within/hero-search:text-indigo-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                          placeholder="Search lands..."
                          className="hero-search-input flex-1 min-w-0 bg-transparent border-none text-sm sm:text-base font-bold text-white placeholder-white/25 focus:ring-0 outline-none px-3 sm:px-4 h-12 sm:h-14"
                        />
                        {searchQuery && (
                          <button onClick={clearSearch} className="flex-shrink-0 px-2 text-white/30 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={executeSearch} 
                          className="flex-shrink-0 btn-hero btn-premium-glow text-[10px] sm:text-xs px-5 sm:px-10 py-3.5 sm:py-5 rounded-full uppercase tracking-widest font-black ml-1 sm:ml-2"
                        >
                          Explore
                        </button>
                      </div>
                    </div>
                </div>
              ) : (
                <div className="w-fit flex items-center justify-center p-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-full shadow-[0_20px_50px_rgba(99,102,241,0.35)] border border-white/10 backdrop-blur-xl group/summary animate-fade-in-up">
                    <div className="flex items-center gap-4 pl-6 pr-1.5 py-1.5">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[14px] font-black tracking-tight leading-none">
                          {properties.length} Results Found
                        </span>
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                          "{searchQuery}" in {listingCategory}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => setIsSearchActive(false)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-full px-5 py-2.5 transition-all active:scale-95 group/edit"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Edit Search</span>
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Area — LIGHT THEME */}
        <div className="container mx-auto px-4 relative z-20">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-text-main">{t("home.title")}</h1>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl border border-ui-border rounded-xl shadow-sm text-sm font-bold text-brand-primary active:scale-95 transition-all"
            >
              <Filter className="w-4 h-4" />
              {t("home.filters")}
            </button>
          </div>

          <div className="flex gap-8">
            {/* LEFT: Sticky Sidebar — Desktop Only */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 h-fit p-6 glass-sidebar space-y-5">
                {/* Search */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-60 px-1">{t("common.search")}</h3>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-brand-primary transition-all duration-300" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search lands, cities..."
                      className="w-full pl-11 pr-11 py-3.5 bg-white/60 border border-ui-border rounded-2xl text-sm focus:bg-white focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 font-bold text-text-main placeholder-text-secondary/60"
                    />
                    {searchQuery && (
                      <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-60 px-1">{t("home.sortBy")}</h3>
                  <div className="space-y-2">
                    {[
                      { id: "latest", label: "Newly Listed" },
                      { id: "price-low-high", label: "Price: Low → High" },
                      { id: "price-high-low", label: "Price: High → Low" }
                    ].map((sort) => (
                      <label key={sort.id} className={`flex items-center gap-3 cursor-pointer group/label p-3.5 rounded-2xl transition-all duration-300 border ${activeSort === sort.id ? 'bg-brand-primary/[0.04] border-brand-primary/10 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
                        <div className="relative w-5 h-5 flex items-center justify-center">
                          <input type="radio" name="sort" value={sort.id} checked={activeSort === sort.id} onChange={() => setActiveSort(sort.id)} className="peer sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${activeSort === sort.id ? 'border-brand-primary border-[6px]' : 'border-gray-200 group-hover/label:border-brand-primary/30'}`} />
                        </div>
                        <span className={`text-sm font-bold transition-colors duration-300 ${activeSort === sort.id ? "text-brand-primary" : "text-text-secondary group-hover/label:text-text-main"}`}>
                          {sort.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="premium-card p-6 transition-all duration-500 group/pricerange relative">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 opacity-60 px-1">{t("home.priceRange")}</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary text-xs font-black">₹</span>
                      <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-xs focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold" />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary text-xs font-black">₹</span>
                      <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-xs focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold" />
                    </div>
                  </div>
                </div>

                {/* Property Type Selector */}
                <div className="premium-card p-6 transition-all duration-500 group/types relative">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 opacity-60 px-1">{t("home.propertyType")}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ id: "", label: "All" }, { id: "Land", label: "Land" }, { id: "House", label: "House" }, { id: "Shop", label: "Shop" }].map((type) => (
                      <button key={type.id} onClick={() => setPropertyType(type.id)} className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${propertyType === type.id ? 'bg-brand-primary text-white border-brand-primary shadow-sm shadow-brand-primary/20' : 'bg-gray-50 text-text-secondary border-transparent hover:bg-gray-100'}`}>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Range & Type */}
                <div className="premium-card p-6 transition-all duration-500 group/sizerange relative">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 opacity-60 px-1">{t("home.sizeRange")}</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" value={minSize} onChange={(e) => setMinSize(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-xs focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold" />
                      <input type="number" placeholder="Max" value={maxSize} onChange={(e) => setMaxSize(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-xs focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold" />
                    </div>
                    <select value={sizeUnitFilter} onChange={(e) => setSizeUnitFilter(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-xs font-black text-brand-primary appearance-none cursor-pointer">
                      <option value="sq ft">sq ft</option>
                      <option value="acres">acres</option>
                      <option value="cents">cents</option>
                      <option value="sqm">sqm</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && <button onClick={clearAllFilters} className="w-full py-2.5 text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 transition-all">{t("home.clearAll")}</button>}
              </div>
            </aside>

            {/* RIGHT: Main Content Area */}
            <div className="flex-1 min-w-0">
              <div className="hidden lg:flex items-end justify-between mb-8 pb-6 border-b border-ui-border">
                <div>
                  <h1 className="text-3xl font-bold text-text-main mb-1">{searchQuery ? `${t("common.search")}: "${searchQuery}"` : t("home.title")}</h1>
                  <p className="text-text-secondary font-medium text-sm">{t("home.subtitle", { count: properties.length })}</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-ui-border shadow-sm">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t("home.sortBy")}:</span>
                  <span className="text-sm font-bold text-brand-primary">{sortLabel}</span>
                </div>
              </div>

              {/* Smart Filter Chips */}
              <div className="mb-10 overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-3 py-2">
                {chipOptions.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => { if (activeChip === chip.id) clearAllFilters(); else { clearAllFilters(); setActiveChip(chip.id); chip.logic(); } }}
                    className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border shadow-sm ${activeChip === chip.id ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-brand-primary shadow-lg shadow-brand-primary/20" : "bg-white/80 backdrop-blur-md text-text-secondary border-ui-border hover:border-brand-primary/20"}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Property Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <PropertySkeleton key={i} />)}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-3xl border border-ui-border shadow-sm">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-secondary font-bold tracking-widest uppercase">{t("home.noResults")}</p>
                  <button onClick={clearAllFilters} className="mt-4 text-brand-primary font-bold text-sm hover:underline">{t("home.showAll")}</button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {properties.map((property, i) => (
                      <motion.div 
                        key={property._id || property.id || i} 
                        variants={{
                          hidden: { opacity: 0, y: 40, scale: 0.96 },
                          visible: { 
                            opacity: 1, 
                            y: 0, 
                            scale: 1, 
                            transition: { type: "spring", stiffness: 350, damping: 30 } 
                          }
                        }}
                      >
                        <PropertyCard property={{...property, id: property._id || property.id}} priority={i < 4} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Infinite Scroll Sentinel */}
                  {page < totalPages && (
                    <div ref={loadMoreRef} className="flex justify-center pt-4 pb-8">
                      {isFetchingMore && (
                        <div className="flex items-center gap-3 px-8 py-4 bg-white border border-ui-border rounded-2xl shadow-sm">
                          <div className="w-5 h-5 border-2 border-gray-200 border-t-brand-primary rounded-full animate-spin" />
                          <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Loading more...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <RecentlyViewed />
            </div>
          </div>
        </div>
      </div>

      {/* 📱 PORTAL-STYLE MOBILE FILTER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex items-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-[85vh] bg-white rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
            >
              <div className="flex justify-center p-3"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
              <div className="px-6 pb-4 flex items-center justify-between border-b border-gray-50">
                <div>
                  <h2 className="text-2xl font-black text-text-main tracking-tight">{t("home.filters")}</h2>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">Fine-tune your landscape</p>
                </div>
                <button onClick={() => setIsMobileFilterOpen(false)} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-text-main">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-gray-50/50">
                {/* 1. Market Selection */}
                <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{t("home.listingCategory")}</h3>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-gray-50 rounded-xl relative">
                    <button onClick={() => setListingCategory("Buy")} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 ${listingCategory === "Buy" ? "text-brand-primary" : "text-text-secondary"}`}>Buy</button>
                    <button onClick={() => setListingCategory("Rent")} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 ${listingCategory === "Rent" ? "text-brand-primary" : "text-text-secondary"}`}>Rent</button>
                    <motion.div layoutId="mobileMarketToggle" className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm" style={{ left: listingCategory === 'Buy' ? '4px' : 'calc(50%)' }} />
                  </div>
                </div>

                {/* 2. Location Search */}
                <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{t("common.search")}</h3>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary w-4 h-4" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-text-main" />
                    {searchQuery && <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
                  </div>
                </div>

                {/* 3. Property Type */}
                <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{t("home.propertyType")}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ id: "", label: "All" }, { id: "Land", label: "Land" }, { id: "House", label: "House" }, { id: "Shop", label: "Shop" }].map((type) => (
                      <button key={type.id} onClick={() => setPropertyType(type.id)} className={`py-3 rounded-xl text-xs font-bold transition-all border ${propertyType === type.id ? 'bg-brand-primary text-white border-brand-primary' : 'bg-gray-50 text-text-secondary border-transparent'}`}>{type.label}</button>
                    ))}
                  </div>
                </div>

                {/* 4. Budget */}
                <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{t("home.priceRange")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold" />
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold" />
                  </div>
                </div>

                {/* 5. Classification */}
                <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{t("home.classification")}</h3>
                  <div className="space-y-2">
                    {[
                      { id: "", label: "All Classifications" },
                      { id: "Nanjai", label: "🌾 Nanjai" },
                      { id: "Punjai", label: "🌵 Punjai" },
                      { id: "Residential", label: "🏡 Residential" },
                      { id: "Agricultural", label: "🌱 Agricultural" }
                    ].map((l) => (
                      <label key={l.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${landTypeFilter === l.id ? 'bg-brand-primary/[0.03] border-brand-primary/20' : 'bg-gray-50 border-transparent'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="mobileLandType" checked={landTypeFilter === l.id} onChange={() => setLandTypeFilter(l.id)} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${landTypeFilter === l.id ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}>
                            {landTypeFilter === l.id && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className={`text-sm font-bold ${landTypeFilter === l.id ? 'text-text-main' : 'text-text-secondary'}`}>{l.label}</span>
                        </div>
                        {landTypeFilter === l.id && <CheckIcon className="w-4 h-4 text-brand-primary" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 6. Sort By */}
                <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{t("home.sortBy")}</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "latest", label: "Newly Listed" },
                      { id: "price-low-high", label: "Price: Low → High" },
                      { id: "price-high-low", label: "Price: High → Low" }
                    ].map((sort) => (
                      <button key={sort.id} onClick={() => setActiveSort(sort.id)} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${activeSort === sort.id ? 'bg-brand-primary/[0.03] border-brand-primary/20 text-brand-primary' : 'bg-gray-50 border-transparent text-text-secondary'}`}>
                        <span className="text-sm font-bold">{sort.label}</span>
                        {activeSort === sort.id && <CheckIcon className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
                <button onClick={() => setIsMobileFilterOpen(false)} className="w-full btn-primary py-4 text-sm font-black uppercase tracking-[0.2em]">
                  View {properties.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-gray-100 border-t-brand-primary rounded-full animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
