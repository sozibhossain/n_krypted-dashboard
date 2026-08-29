"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, User, Utensils } from "lucide-react";
import { checkInApi, reviewApi, userApi } from "@/lib/api";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = use(params);
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: () => userApi.getUserById(id),
  });
  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ["user-check-ins", id],
    queryFn: () => checkInApi.getForUser(id),
  });
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["user-reviews", id],
    queryFn: () => reviewApi.getAllReviews({ userId: id, limit: 4 }),
  });

  const location = [user?.cityState, user?.country].filter(Boolean).join(", ");

  return (
    <div className="space-y-8 rounded-3xl border border-[#F0ECE1] bg-white p-6 shadow-xs sm:p-8">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#0097A7] hover:underline sm:text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Zurück zur Benutzerübersicht</span>
      </Link>

      {userLoading ? (
        <Skeleton className="h-28 rounded-2xl" />
      ) : user ? (
        <div className="flex flex-col justify-between gap-6 border-b border-[#F5F2E8] pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <User className="h-7 w-7 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E1E1E]">{user.name}</h2>
              <p className="text-xs text-[#718096]">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs text-[#4A5568] sm:flex-row sm:items-center sm:gap-8 sm:text-sm">
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-red-500" />
                <span>{location}</span>
              </div>
            )}
            {user.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                <span>{user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-[#718096]">
          Benutzer nicht gefunden.
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1E1E]">Einchecken</h3>
          <span className="text-xs text-[#718096]">{checkIns.length} Ergebnisse</span>
        </div>
        {checkInsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : checkIns.length === 0 ? (
          <div className="rounded-xl border border-[#F0ECE1] py-8 text-center text-sm text-[#718096]">
            Keine Check-ins gefunden.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checkIns.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-xl border border-[#F0ECE1] p-4 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    {item.restaurantImage ? (
                      <Image
                        src={item.restaurantImage}
                        alt={item.restaurantName ?? "Restaurant"}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <Utensils className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E1E1E]">
                      {item.restaurantName ?? "Eintrag nicht verf\u00fcgbar"}
                    </h4>
                    {item.restaurantLocation && (
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#718096]">
                        <MapPin className="h-2.5 w-2.5 shrink-0 text-red-500" />
                        <span>{item.restaurantLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-[#718096]">
                  {formatDate(item.checkedInAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-[#F5F2E8] pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1E1E]">Rezensionen</h3>
          <span className="text-xs text-[#718096]">
            {reviewsData?.meta.totalItems ?? 0} Ergebnisse
          </span>
        </div>
        {reviewsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        ) : reviewsData?.data.length ? (
          <div className="space-y-4">
            {reviewsData.data.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#F0ECE1] py-8 text-center text-sm text-[#718096]">
            Keine Bewertungen gefunden.
          </div>
        )}
      </section>
    </div>
  );
}
