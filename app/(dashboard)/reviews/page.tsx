"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage, reviewApi } from "@/lib/api";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["all-reviews-page", currentPage],
    queryFn: () => reviewApi.getAllReviews({ page: currentPage, limit: 6 }),
  });
  const currentPageIds = data?.data.map((review) => review._id) ?? [];
  const allSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => reviewApi.bulkDeleteReviews(ids),
    onSuccess: (result) => {
      setSelectedIds(new Set());
      setCurrentPage(1);
      toast.success(`${result.deletedCount} Bewertungen wurden gel\u00f6scht.`);
      queryClient.invalidateQueries({ queryKey: ["all-reviews-page"] });
      queryClient.invalidateQueries({ queryKey: ["top-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) =>
      toast.error(
        getApiErrorMessage(error, "Die Bewertungen konnten nicht gel\u00f6scht werden.")
      ),
  });

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCurrentPage = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allSelected) currentPageIds.forEach((id) => next.delete(id));
      else currentPageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    if (
      ids.length > 0 &&
      window.confirm(
        `${ids.length} ausgew\u00e4hlte Bewertungen dauerhaft l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.`
      )
    ) {
      bulkDeleteMutation.mutate(ids);
    }
  };

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

        <div className="flex flex-wrap items-center gap-3">
        {currentPageIds.length > 0 && (
          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#718096]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleCurrentPage}
              className="h-4 w-4 accent-[#0097A7]"
            />
            Alle auswählen
          </label>
        )}
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {bulkDeleteMutation.isPending
              ? "Wird gel\u00f6scht..."
              : `${selectedIds.size} l\u00f6schen`}
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0097A7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </Link>
        </div>
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
            <div key={review._id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(review._id)}
                onChange={() => toggleSelected(review._id)}
                aria-label="Bewertung ausw\u00e4hlen"
                className="mt-5 h-4 w-4 shrink-0 accent-[#0097A7]"
              />
              <div className="min-w-0 flex-1">
                <ReviewCard review={review} />
              </div>
            </div>
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
          onPageChange={(page) => {
            setCurrentPage(page);
            setSelectedIds(new Set());
          }}
          className="pt-4 border-t border-[#F5F2E8]"
        />
      )}
    </div>
  );
}
