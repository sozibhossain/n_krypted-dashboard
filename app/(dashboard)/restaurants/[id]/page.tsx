"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Ban,
  Star,
  MessageSquare,
  ThumbsUp,
  Eye,
  ArrowLeft,
  ChevronDown,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { restaurantApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface RestaurantDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailsPage({
  params,
}: RestaurantDetailsPageProps) {
  const { id } = use(params);
  const [isBlocked, setIsBlocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant-detail", id],
    queryFn: () => restaurantApi.getRestaurantById(id),
  });

  const handleBlock = () => {
    setIsBlocked(!isBlocked);
    toast.success(
      isBlocked
        ? "Restaurant erfolgreich entsperrt!"
        : "Restaurant erfolgreich gesperrt!"
    );
  };

  const diningImages = restaurant?.diningImages || [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&auto=format&fit=crop&q=80",
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#F0ECE1] p-6 sm:p-8 shadow-xs space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0097A7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zum Restaurantmanagement</span>
        </Link>
      </div>

      {/* Header Profile Banner */}
      {isLoading ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F5F2E8]">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80"
                alt={restaurant?.title || "Restaurant"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E1E1E]">
                {restaurant?.name || "Jenny Wilson"}
              </h2>
              <p className="text-xs text-[#718096]">
                {restaurant?.email || "example@gmail.com"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs sm:text-sm text-[#4A5568]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                {restaurant?.location?.city || "München"},{" "}
                {restaurant?.location?.country || "Deutschland"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0097A7] shrink-0" />
              <span>{restaurant?.openingHours || "Montag bis Samstag (9 bis 20 Uhr)"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500 shrink-0" />
              <span>{restaurant?.phone || "+49 151 23456789"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0097A7] shrink-0" />
              <span>{restaurant?.reservationNote || "Reservation usually required"}</span>
            </div>
          </div>

          <div>
            <Button
              variant="destructive"
              onClick={handleBlock}
              className="rounded-xl flex items-center gap-2 px-6 h-11"
            >
              <Ban className="w-4 h-4 text-red-500" />
              <span>{isBlocked ? "Entsperren" : "Block"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* 4 Yellow Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFF9E6] border border-[#FEEFB3] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-xs text-[#718096] font-medium leading-tight">
              Durchschnittliche Bewertung
            </span>
          </div>
          <span className="text-lg font-bold text-[#1E1E1E]">4.8</span>
        </div>

        <div className="bg-[#FFF9E6] border border-[#FEEFB3] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#22C55E]" />
            <span className="text-xs text-[#718096] font-medium leading-tight">
              Gesamtbewertungen
            </span>
          </div>
          <span className="text-lg font-bold text-[#1E1E1E]">1.240</span>
        </div>

        <div className="bg-[#FFF9E6] border border-[#FEEFB3] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThumbsUp className="w-5 h-5 text-[#3B82F6]" />
            <span className="text-xs text-[#718096] font-medium leading-tight">
              Gesamteinchecken
            </span>
          </div>
          <span className="text-lg font-bold text-[#1E1E1E]">1,2k</span>
        </div>

        <div className="bg-[#FFF9E6] border border-[#FEEFB3] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-[#8B5CF6]" />
            <span className="text-xs text-[#718096] font-medium leading-tight">
              Gesamtzuschauer
            </span>
          </div>
          <span className="text-lg font-bold text-[#1E1E1E]">13,6k</span>
        </div>
      </div>

      {/* Section 1: Essbereich (Dining Area) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1E1E]">Essbereich</h3>
          <span className="text-xs text-[#718096]">
            7. Ergebnis des Eincheckens
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {diningImages.map((img, idx) => (
            <div
              key={idx}
              className="relative h-44 rounded-2xl overflow-hidden shadow-2xs group"
            >
              <Image
                src={img}
                alt={`Essbereich ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Spezialitäten (Specialties) */}
      <div className="space-y-4 pt-4 border-t border-[#F5F2E8]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1E1E]">Spezialitäten</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(restaurant?.specialties || []).map((dish) => (
            <Link
              key={dish._id}
              href={`/restaurants/${id}/dishes/${dish._id}`}
              className="flex flex-col bg-white rounded-2xl border border-[#F0ECE1] overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <Image
                  src={dish.images[0] || "https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=600&auto=format&fit=crop&q=80"}
                  alt={dish.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-base font-bold text-[#1E1E1E]">
                      {dish.title}
                    </h4>
                    <span className="bg-[#EF4444] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      SD {dish.sdRating || 4.5} ★
                    </span>
                  </div>

                  <p className="text-xs text-[#718096] line-clamp-3 leading-relaxed mb-4">
                    {dish.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F7F5EC]">
                  <span className="text-sm font-bold text-[#1E1E1E]">
                    {dish.price.toFixed(2).replace(".", ",")} $
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#718096]">
                    <span className="text-[#F59E0B] font-semibold">
                      {dish.userRating || 4.5} ★
                    </span>
                    <span>{dish.reviewCount || 12} Bewertungen</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 3: Alle Gerichte (All Dishes) */}
      <div className="space-y-4 pt-4 border-t border-[#F5F2E8]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1E1E]">Alle Gerichte</h3>

          {/* Categories Dropdown Filter */}
          <div className="relative">
            <button className="flex items-center gap-2 text-xs font-medium text-[#718096] bg-[#F8F9FA] border border-[#E2E8F0] px-3.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <span>Kategorien</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(restaurant?.allDishes || []).map((dish) => (
            <Link
              key={dish._id}
              href={`/restaurants/${id}/dishes/${dish._id}`}
              className="relative h-44 rounded-2xl overflow-hidden shadow-2xs group cursor-pointer"
            >
              <Image
                src={dish.images[0] || "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80"}
                alt={dish.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 16vw"
              />

              {/* Top Badges */}
              <div className="absolute top-2 left-2 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                SD 4,5 ★
              </div>
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[#1E1E1E] text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                <span>4,5</span>
                <span className="text-[#F59E0B]">★</span>
              </div>

              {/* Bottom Dish Name Overlay */}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                <Utensils className="w-3 h-3 text-white" />
                <span>{dish.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
