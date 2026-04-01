"use client";

import { motion } from "framer-motion";

export default function PropertySkeleton() {
  return (
    <div className="premium-card h-[450px] flex flex-col bg-white overflow-hidden border border-ui-border shadow-soft">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer-effect opacity-50" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow space-y-5">
        {/* Title Lines */}
        <div className="space-y-2.5">
          <div className="h-5 bg-gray-100 rounded-xl w-full animate-pulse opacity-60" />
          <div className="h-5 bg-gray-100 rounded-xl w-3/4 animate-pulse opacity-60" />
        </div>

        {/* Tag Skeleton */}
        <div className="h-6 bg-brand-primary/5 rounded-full w-28 animate-pulse" />

        {/* Location Skeleton */}
        <div className="flex items-center gap-2.5">
          <div className="w-4.5 h-4.5 rounded-full bg-gray-50 animate-pulse" />
          <div className="h-4 bg-gray-50 rounded-lg w-1/2 animate-pulse" />
        </div>

        <div className="mt-auto pt-5 border-t border-ui-border/40 flex items-center justify-between">
          {/* Price Skeleton */}
          <div className="h-8 bg-gray-100 rounded-xl w-32 animate-pulse opacity-70" />
          {/* Button Skeleton */}
          <div className="h-10 bg-gray-50 rounded-2xl w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
