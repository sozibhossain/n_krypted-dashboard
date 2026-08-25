"use client";

import { useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { Map, MapClickHandler, MapMarker, MapView } from "@/components/ui/map";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface PickedLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export default function LocationPickerMap({
  value,
  onChange,
}: {
  value: PickedLocation;
  onChange: (location: PickedLocation) => void;
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const center: [number, number] = [value.latitude || 51.1657, value.longitude || 10.4515];

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const result = await response.json();
      onChange({
        latitude,
        longitude,
        address: result.display_name || value.address,
        city: result.address?.city || result.address?.town || result.address?.village || value.city,
        country: result.address?.country || value.country,
      });
    } catch {
      onChange({ ...value, latitude, longitude });
    }
  };

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
      );
      const [result] = await response.json();
      if (result) await reverseGeocode(Number(result.lat), Number(result.lon));
    } finally {
      setSearching(false);
    }
  };

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      void reverseGeocode(coords.latitude, coords.longitude);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void search();
              }
            }}
            placeholder="Adresse oder Ort auf der Karte suchen"
            className="pl-9"
          />
        </div>
        <Button type="button" onClick={() => void search()} disabled={searching}>
          Suchen
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={locate} title="Mein Standort">
          <LocateFixed className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-slate-100">
        <Map center={center}>
          <MapView center={center} />
          <MapClickHandler onSelect={(lat, lng) => void reverseGeocode(lat, lng)} />
          <MapMarker position={center}>Ausgewählter Restaurantstandort</MapMarker>
        </Map>
      </div>
      <p className="text-xs text-[#718096]">Klicke auf die Karte, suche eine Adresse oder nutze deinen aktuellen Standort.</p>
    </div>
  );
}
