"use client";

// Pure-CSS skeleton — no Framer Motion dependency needed here
export default function PropertySkeleton() {
  return (
    <div className="premium-card h-[450px] flex flex-col bg-[var(--surface)] overflow-hidden border border-[var(--ui-border)] shadow-soft">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-[var(--skeleton-base)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-effect opacity-50" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow space-y-5">
        {/* Title Lines */}
        <div className="space-y-2.5">
          <div className="h-5 bg-[var(--skeleton-base)] rounded-xl w-full animate-pulse" />
          <div className="h-5 bg-[var(--skeleton-base)] rounded-xl w-3/4 animate-pulse" />
        </div>

        {/* Tag Skeleton */}
        <div className="h-6 bg-brand-primary/10 rounded-full w-28 animate-pulse" />

        {/* Location Skeleton */}
        <div className="flex items-center gap-2.5">
          <div className="w-4.5 h-4.5 rounded-full bg-[var(--skeleton-base)] animate-pulse" />
          <div className="h-4 bg-[var(--skeleton-base)] rounded-lg w-1/2 animate-pulse" />
        </div>

        <div className="mt-auto pt-5 border-t border-[var(--ui-border)] flex items-center justify-between">
          {/* Price Skeleton */}
          <div className="h-8 bg-[var(--skeleton-highlight)] rounded-xl w-32 animate-pulse" />
          {/* Button Skeleton */}
          <div className="h-10 bg-[var(--skeleton-base)] rounded-2xl w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
