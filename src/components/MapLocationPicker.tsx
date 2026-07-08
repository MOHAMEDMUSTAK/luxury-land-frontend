"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Skip SSR
const MapLocationPickerLeaflet = dynamic(() => import("./MapLocationPickerLeaflet"), { ssr: false });

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function MapLocationPicker(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <MapLocationPickerLeaflet {...props} />
      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <span className="inline-block w-4 h-4 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center font-bold">ℹ</span> 
        Click anywhere on the map to pin the exact property location.
      </p>
    </div>
  );
}
