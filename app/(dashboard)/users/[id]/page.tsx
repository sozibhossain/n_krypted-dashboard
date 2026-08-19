"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Phone,
  Ban,
  ArrowLeft,
  Calendar,
  Utensils,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { userApi, reviewApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/components/dashboard/ReviewCard";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [isBlocked, setIsBlocked] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: () => userApi.getUserById(id),
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["user-reviews", id],
    queryFn: () => reviewApi.getAllReviews({ limit: 4 }),
  });

  const handleBlock = () => {
    setIsBlocked(!isBlocked);
    toast.success(
      isBlocked
        ? "Benutzer erfolgreich entsperrt!"
        : "Benutzer erfolgreich gesperrt!"
    );
  };

  const checkIns = [
    { id: "c1", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c2", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c3", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c4", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c5", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c6", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c7", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c8", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
    { id: "c9", restaurant: "Restaurant JAN", location: "München, Deutschland", date: "3. Juni 2026" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#F0ECE1] p-6 sm:p-8 shadow-xs space-y-8">
      {/* Back button link */}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0097A7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Benutzerübersicht</span>
        </Link>
      </div>

      {/* User Header Profile Card */}
      {userLoading ? (
        <Skeleton className="h-28 rounded-2xl" />
      ) : (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F5F2E8]">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
              <Image
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                }
                alt={user?.name || "Jenny Wilson"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E1E1E]">
                {user?.name || "Jenny Wilson"}
              </h2>
              <p className="text-xs text-[#718096]">
                {user?.email || "example@gmail.com"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-xs sm:text-sm text-[#4A5568]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span>{user?.cityState || "München, Deutschland"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500 shrink-0" />
              <span>{user?.phoneNumber || "+49 151 23456789"}</span>
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

      {/* Section 1: Einchecken (Check-ins) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1E1E]">Einchecken</h3>
          <span className="text-xs text-[#718096]">
            7. Ergebnis des Eincheckens
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {checkIns.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[#F0ECE1] bg-white hover:border-[#0097A7]/40 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-black shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80"
                    alt={item.restaurant}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E1E1E] leading-tight">
                    {item.restaurant}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-[#718096] mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-[#718096] shrink-0 font-medium">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Rezensionen (Reviews) */}
      <div className="space-y-4 pt-4 border-t border-[#F5F2E8]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1E1E]">Rezensionen</h3>
          <span className="text-xs text-[#718096]">
            Ergebnis 7 der Überprüfung
          </span>
        </div>

        {reviewsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsData?.data?.slice(0, 2).map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
