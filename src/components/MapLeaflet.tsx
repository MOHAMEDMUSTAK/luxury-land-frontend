"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet + Next.js
// Next JS overrides the leaflet assets path inappropriately
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  lat: number;
  lng: number;
  title?: string;
}

export default function MapLeaflet({ lat, lng, title }: MapProps) {
  useEffect(() => {
    // Ensuring the window fix is correctly applied for Leaflet
  }, []);

  return (
    <div className="w-full h-[400px] sm:h-[500px] overflow-hidden rounded-2xl relative z-0">
      <MapContainer 
        center={[lat, lng]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={customIcon} />
      </MapContainer>
    </div>
  );
}
