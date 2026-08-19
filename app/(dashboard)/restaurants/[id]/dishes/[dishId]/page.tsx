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
} from "lucide-react";
import { toast } from "sonner";
import { restaurantApi, reviewApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/components/dashboard/ReviewCard";

interface DishDetailsPageProps {
  params: Promise<{ id: string; dishId: string }>;
}

export default function DishDetailsPage({ params }: DishDetailsPageProps) {
  const { id, dishId } = use(params);
  const [isBlocked, setIsBlocked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ["restaurant-detail", id],
    queryFn: () => restaurantApi.getRestaurantById(id),
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["dish-reviews", dishId],
    queryFn: () => reviewApi.getAllReviews({ limit: 2 }),
  });

  const handleBlock = () => {
    setIsBlocked(!isBlocked);
    toast.success(
      isBlocked
        ? "Restaurant erfolgreich entsperrt!"
        : "Restaurant erfolgreich gesperrt!"
    );
  };

  const dishImages = [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#F0ECE1] p-6 sm:p-8 shadow-xs space-y-8">
      {/* Back button */}
      <div>
        <Link
          href={`/restaurants/${id}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0097A7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Restaurantdetailseite</span>
        </Link>
      </div>

      {/* Header Profile Banner */}
      {restaurantLoading ? (
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

      {/* Dish Hero Section */}
      <div className="space-y-4 pt-4 border-t border-[#F5F2E8]">
        <h3 className="text-base font-bold text-[#1E1E1E]">Spezialitäten</h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gallery: 1 Large Image + 3 Thumbnails */}
          <div className="lg:col-span-5 flex gap-4">
            <div className="relative flex-1 h-64 sm:h-72 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src={dishImages[selectedImageIndex]}
                alt="Selected Dish"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              {dishImages.slice(1, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx + 1)}
                  className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx + 1
                      ? "border-[#0097A7] scale-105"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Dish Details Text */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#1E1E1E]">Schnitzel</h2>
                <div className="flex items-center gap-3">
                  <span className="text-red-500 font-bold text-sm">
                    SD 4,5 ★
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-[#1E1E1E]">15,45 $</span>
                <div className="flex items-center gap-1 text-xs text-[#718096]">
                  <span className="text-[#F59E0B] font-bold">4,5 ★</span>
                  <span>12 Bewertungen</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#1E1E1E] mb-2">
                  Beschreibung
                </h4>
                <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
                  Dieses Schnitzel ist seit der Gründung des Restaurants eine beliebte Spezialität und zählt nach wie vor zu den meistbestellten Gerichten unserer Stammgäste. Seine Beliebtheit verdankt es einer sorgfältig verfeinerten Zubereitungsmethode, die über die Jahre bewahrt wurde. Das Fleisch wird fachmännisch zart gemacht, mit einer speziellen Paniermischung umhüllt und nach traditionellen Methoden goldbraun und knusprig gebraten. Zusammen mit einer hausgemachten Gewürzmischung und frisch serviert mit klassischen Beilagen bietet dieses Gericht den authentischen Geschmack und die Qualität, die unsere Gäste immer wieder aufs Neue begeistern.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Section: Zubereitungsmethode */}
      <div className="space-y-4 pt-6 border-t border-[#F5F2E8]">
        <h3 className="text-base font-bold text-[#1E1E1E]">
          Zubereitungsmethode
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#FFFDF5] p-6 rounded-2xl border border-[#F0ECE1]">
          {/* Main Ingredients */}
          <div>
            <h4 className="text-sm font-bold text-[#0097A7] mb-3">
              Hauptzutaten
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 text-xs sm:text-sm text-[#4A5568]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Zartes Fleischkotelett</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Salz und Pfeffer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Paniermehl</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Zitrone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Eier</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Frische Kräuter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Mehl</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                <span>Knusprige Pommes</span>
              </div>
            </div>
          </div>

          {/* Manufacturing Process */}
          <div className="border-t md:border-t-0 md:border-l border-[#EFE9D3] pt-4 md:pt-0 md:pl-8">
            <h4 className="text-sm font-bold text-[#0097A7] mb-3">
              Herstellungsprozess
            </h4>
            <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
              Das Fleisch wird zunächst zart geklopft, um eine saftige und zarte Konsistenz zu gewährleisten. Anschließend wird es leicht in Mehl gewendet, durch verquirlte Eier gezogen und mit feinen Semmelbröseln paniert. Das panierte Schnitzel wird goldbraun und knusprig gebraten, während es innen zart bleibt. Serviert wird es frisch mit knusprigen Pommes frites, Zitronenspalten und Kräutern – so entsteht das klassische Schnitzel-Erlebnis, das weltweit beliebt ist.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4 pt-6 border-t border-[#F5F2E8]">
        <h3 className="text-base font-bold text-[#1E1E1E]">Rezensionen</h3>

        {reviewsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsData?.data?.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
