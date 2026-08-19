"use client";

import Image from "next/image";
import {
  MapPin,
  Calendar,
  Clock,
  Utensils,
  Users,
  Star,
  MoreVertical,
} from "lucide-react";
import { ReviewItem } from "@/lib/api";

interface ReviewCardProps {
  review: ReviewItem;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const rating = review.ratings || 4;

  return (
    <div className="bg-white rounded-2xl border border-[#F0ECE1] p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Restaurant Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F7F5EC]">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-black shrink-0">
            <Image
              src={review.restaurantAvatar || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80"}
              alt={review.restaurantName || "Restaurant"}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1E1E1E] leading-tight">
              {review.restaurantName || "Restaurant JAN"}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-[#718096]">
              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
              <span>{review.restaurantLocation || "München, Deutschland"}</span>
            </div>
          </div>
        </div>

        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md" aria-label="Optionen">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Review Content & Thumbnail */}
      <div className="flex flex-col lg:flex-row gap-5 pt-4">
        {/* Reviewer info and comment */}
        <div className="flex-1 space-y-3">
          {/* User profile & rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">
                <Image
                  src={review.userID?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                  alt={review.userID?.name || "User"}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1E1E1E]">
                  {review.userID?.name || "Niti Kapoor"}
                </div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rating
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <span className="text-xs text-[#718096]">
              {review.timeAgo || "vor 7 Minuten"}
            </span>
          </div>

          {/* Meta badges: Date, Time, Food, Guests */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#718096] pt-1">
            <div className="flex items-center gap-1.5 text-[#0097A7]">
              <Calendar className="w-3.5 h-3.5 text-[#0097A7]" />
              <span>{review.reviewDate || "4, Juni 2026"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0097A7]">
              <Clock className="w-3.5 h-3.5 text-[#0097A7]" />
              <span>{review.reviewTime || "21:30 Uhr"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0097A7]">
              <Utensils className="w-3.5 h-3.5 text-[#0097A7]" />
              <span>{review.mealCategory || "Schnitzel"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0097A7]">
              <Users className="w-3.5 h-3.5 text-[#0097A7]" />
              <span>{review.guestCount || 4} Personen</span>
            </div>
          </div>

          {/* Review text */}
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed pt-1">
            {review.reviewComment}
          </p>
        </div>

        {/* Dish Thumbnail on right */}
        {review.dishImage && (
          <div className="relative w-full lg:w-44 h-32 rounded-xl overflow-hidden shrink-0 shadow-xs group">
            <Image
              src={review.dishImage}
              alt={review.dishName || "Dish"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="180px"
            />
            {/* Dish Tag overlay */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
              <Utensils className="w-3 h-3 text-white" />
              <span>{review.dishName || "Rouladen"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
