"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { reviewApi } from "@/lib/api";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["all-reviews-page", currentPage],
    queryFn: () => reviewApi.getAllReviews({ page: currentPage, limit: 6 }),
  });

  return (
    <div className="bg-white rounded-3xl border border-[#F0ECE1] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F2E8]">
        <div>
          <h2 className="text-xl font-bold text-[#1E1E1E]">Top-Bewertungen</h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
            Sehen Sie sich die Top-Bewertungen von Nutzern an.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0097A7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </Link>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-44 rounded-2xl" />
          ))
        ) : data?.data?.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Keine Bewertungen gefunden.
          </div>
        ) : (
          data?.data?.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))
        )}
      </div>

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={data.meta.currentPage}
          totalPages={data.meta.totalPages}
          totalItems={data.meta.totalItems}
          itemsPerPage={data.meta.itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          className="pt-4 border-t border-[#F5F2E8]"
        />
      )}
    </div>
  );
}
