"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: LocationPickerProps) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return lat && lng ? (
    <Marker position={[lat, lng]} icon={customIcon} />
  ) : null;
}

// Default center: India/Chennai or wherever global defaults are
const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707];

export default function MapLocationPickerLeaflet({ lat, lng, onChange }: LocationPickerProps) {
  const [center, setCenter] = useState<[number, number]>(
    lat && lng ? [lat, lng] : DEFAULT_CENTER
  );

  useEffect(() => {
    // If external props update, update center if it's the first time
    if (lat && lng) {
      setCenter([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div className="w-full h-[300px] overflow-hidden rounded-xl border border-gray-200 relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
