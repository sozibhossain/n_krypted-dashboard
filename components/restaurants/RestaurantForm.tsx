"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminRestaurantPayload, RestaurantItem, RestaurantPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />,
});

export function RestaurantForm({
  restaurant,
  includeOwner = false,
  submitting = false,
  onSubmit,
  onCancel,
}: {
  restaurant?: RestaurantItem | null;
  includeOwner?: boolean;
  submitting?: boolean;
  onSubmit: (payload: RestaurantPayload | AdminRestaurantPayload) => void;
  onCancel?: () => void;
}) {
  const isEditing = Boolean(restaurant);
  const [title, setTitle] = useState(restaurant?.title ?? "");
  const [description, setDescription] = useState(restaurant?.description ?? "");
  const [shortDescription, setShortDescription] = useState(restaurant?.shortDescription ?? "");
  const [price, setPrice] = useState(restaurant?.price?.toString() ?? "0");
  const [image, setImage] = useState(restaurant?.images?.[0] ?? "");
  const [address, setAddress] = useState(restaurant?.location?.address ?? "");
  const [city, setCity] = useState(restaurant?.location?.city ?? "");
  const [country, setCountry] = useState(restaurant?.location?.country ?? "");
  const [latitude, setLatitude] = useState(restaurant?.location?.latitude ?? 51.1657);
  const [longitude, setLongitude] = useState(restaurant?.location?.longitude ?? 10.4515);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  useEffect(() => {
    if (restaurant) {
      setTitle(restaurant.title || "");
      setDescription(restaurant.description || "");
      setShortDescription(restaurant.shortDescription || "");
      setPrice(restaurant.price?.toString() || "0");
      setImage(restaurant.images?.[0] || "");
      setAddress(restaurant.location?.address || "");
      setCity(restaurant.location?.city || "");
      setCountry(restaurant.location?.country || "");
      setLatitude(restaurant.location?.latitude ?? 51.1657);
      setLongitude(restaurant.location?.longitude ?? 10.4515);
    } else {
      setTitle("");
      setDescription("");
      setShortDescription("");
      setPrice("0");
      setImage("");
      setAddress("");
      setCity("");
      setCountry("");
      setLatitude(51.1657);
      setLongitude(10.4515);
      setOwnerName("");
      setOwnerEmail("");
      setOwnerPassword("");
      setOwnerPhone("");
    }
  }, [restaurant]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload: RestaurantPayload = {
      title,
      description,
      shortDescription,
      price: Number(price) || 0,
      images: image.trim() ? [image.trim()] : [],
      location: { address, city, country, latitude, longitude },
    };
    onSubmit(
      includeOwner && !isEditing
        ? {
            ...payload,
            owner: { name: ownerName, email: ownerEmail, password: ownerPassword, phoneNumber: ownerPhone },
          }
        : payload
    );
  };

  const labelClass = "flex flex-col gap-2 text-xs font-semibold text-[#334155]";
  return (
    <form onSubmit={submit} className="space-y-6">
      {includeOwner && !isEditing && (
        <fieldset className="grid gap-4 rounded-2xl border border-[#FEEFB3] bg-[#FFFBE9] p-5 sm:grid-cols-2">
          <legend className="px-2 text-sm font-bold text-[#1E1E1E]">Owner Login</legend>
          <label className={labelClass}>
            <span>Name</span>
            <Input required placeholder="Name des Besitzers" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </label>
          <label className={labelClass}>
            <span>E-Mail</span>
            <Input required type="email" placeholder="owner@example.com" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
          </label>
          <label className={labelClass}>
            <span>Passwort</span>
            <Input required minLength={6} type="password" placeholder="Mindestens 6 Zeichen" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} />
          </label>
          <label className={labelClass}>
            <span>Telefon</span>
            <Input placeholder="+49 123 456789" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
          </label>
        </fieldset>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          <span>Restaurantname</span>
          <Input required placeholder="z. B. Sonnengarten Restaurant" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className={labelClass}>
          <span>Startpreis (€)</span>
          <Input min="0" step="0.01" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          <span>Kurzbeschreibung</span>
          <Input placeholder="Kurze Zusammenfassung für die Karten- und Listenansicht" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          <span>Beschreibung</span>
          <textarea required placeholder="Detaillierte Beschreibung des Restaurants..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28 w-full rounded-xl border border-[#90CAF9] bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[#0097A7]" />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          <span>Bild-URL</span>
          <Input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/..." />
        </label>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E1E1E]">Restaurantstandort</h3>
        <LocationPickerMap
          value={{ latitude, longitude, address, city, country }}
          onChange={(location) => {
            setLatitude(location.latitude);
            setLongitude(location.longitude);
            if (location.address) setAddress(location.address);
            if (location.city) setCity(location.city);
            if (location.country) setCountry(location.country);
          }}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={labelClass}>
            <span>Adresse</span>
            <Input required placeholder="Straße und Hausnummer" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className={labelClass}>
            <span>Stadt</span>
            <Input required placeholder="z. B. Berlin" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label className={labelClass}>
            <span>Land</span>
            <Input required placeholder="z. B. Deutschland" value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <span>Abbrechen</span>
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span>
            {isEditing
              ? "Änderungen speichern"
              : includeOwner
              ? "Restaurant direkt erstellen"
              : "Zur Genehmigung einreichen"}
          </span>
        </Button>
      </div>
    </form>
  );
}
