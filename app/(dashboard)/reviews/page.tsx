"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage, reviewApi, type ReviewItem } from "@/lib/api";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";

export default function ReviewsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);

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
      setIsBulkDeleteOpen(false);
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

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; reviewComment: string; ratings: number }) =>
      reviewApi.updateReview(payload.id, {
        reviewComment: payload.reviewComment,
        ratings: payload.ratings,
      }),
    onSuccess: () => {
      setEditingReview(null);
      toast.success("Bewertung wurde aktualisiert.");
      queryClient.invalidateQueries({ queryKey: ["all-reviews-page"] });
      queryClient.invalidateQueries({ queryKey: ["top-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) =>
      toast.error(getApiErrorMessage(error, "Die Bewertung konnte nicht aktualisiert werden.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewApi.deleteReview(id),
    onSuccess: (_result, deletedId) => {
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(deletedId);
        return next;
      });
      setReviewToDelete(null);
      toast.success("Bewertung wurde gelöscht.");
      queryClient.invalidateQueries({ queryKey: ["all-reviews-page"] });
      queryClient.invalidateQueries({ queryKey: ["top-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) =>
      toast.error(getApiErrorMessage(error, "Die Bewertung konnte nicht gelöscht werden.")),
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
    if (selectedIds.size > 0) setIsBulkDeleteOpen(true);
  };

  const openEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setEditComment(review.reviewComment);
    setEditRating(review.ratings);
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
        {isAdmin && currentPageIds.length > 0 && (
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
        {isAdmin && selectedIds.size > 0 && (
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>
              {bulkDeleteMutation.isPending
                ? "Wird gelöscht..."
                : `${selectedIds.size} löschen`}
            </span>
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
              {isAdmin && (
                <input
                  type="checkbox"
                  checked={selectedIds.has(review._id)}
                  onChange={() => toggleSelected(review._id)}
                  aria-label="Bewertung ausw\u00e4hlen"
                  className="mt-5 h-4 w-4 shrink-0 accent-[#0097A7]"
                />
              )}
              <div className="min-w-0 flex-1">
                <ReviewCard review={review} />
                {isAdmin && (
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(review)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#B2EBF2] px-3 text-xs font-semibold text-[#00838F] hover:bg-[#E0F7FA]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewToDelete(review)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Löschen
                    </button>
                  </div>
                )}
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

      <Modal
        isOpen={editingReview !== null}
        onClose={() => {
          if (!updateMutation.isPending) setEditingReview(null);
        }}
        title="Bewertung bearbeiten"
        description="Bewertungstext und Sterne aktualisieren."
        maxWidth="max-w-lg"
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!editingReview || !editComment.trim()) return;
            updateMutation.mutate({
              id: editingReview._id,
              reviewComment: editComment.trim(),
              ratings: editRating,
            });
          }}
        >
          <div>
            <div className="mb-2 text-xs font-semibold text-[#334155]">Bewertung</div>
            <div className="flex gap-1" role="radiogroup" aria-label="Sternebewertung">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setEditRating(rating)}
                  aria-label={`${rating} Sterne`}
                  aria-pressed={editRating === rating}
                  className="rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#0097A7]"
                >
                  <Star
                    className={`h-7 w-7 ${
                      rating <= editRating
                        ? "fill-[#F59E0B] text-[#F59E0B]"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <label className="block text-xs font-semibold text-[#334155]">
            <span className="mb-2 block">Bewertungstext</span>
            <textarea
              value={editComment}
              onChange={(event) => setEditComment(event.target.value)}
              required
              rows={5}
              maxLength={1000}
              className="w-full resize-y rounded-xl border border-[#90CAF9] bg-white p-3 text-sm font-normal text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#0097A7]"
            />
            <span className="mt-1 block text-right font-normal text-[#718096]">
              {editComment.length}/1000
            </span>
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              disabled={updateMutation.isPending}
              className="h-11 rounded-xl border border-[#E2E8F0] px-5 text-sm font-semibold text-[#4A5568] hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !editComment.trim()}
              className="h-11 rounded-xl bg-[#0097A7] px-5 text-sm font-semibold text-white hover:bg-[#00838F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending ? "Wird gespeichert..." : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={reviewToDelete !== null}
        onClose={() => {
          if (!deleteMutation.isPending) setReviewToDelete(null);
        }}
        title="Bewertung löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden."
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
            Die Bewertung von {reviewToDelete?.userID?.name ?? "diesem Benutzer"} wird
            dauerhaft gelöscht.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setReviewToDelete(null)}
              disabled={deleteMutation.isPending}
              className="h-11 rounded-xl border border-[#E2E8F0] px-5 text-sm font-semibold text-[#4A5568] hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => reviewToDelete && deleteMutation.mutate(reviewToDelete._id)}
              disabled={deleteMutation.isPending || reviewToDelete === null}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? "Wird gelöscht..." : "Dauerhaft löschen"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isBulkDeleteOpen}
        onClose={() => {
          if (!bulkDeleteMutation.isPending) setIsBulkDeleteOpen(false);
        }}
        title="Bewertungen löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden."
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
            {selectedIds.size} ausgewählte Bewertungen werden dauerhaft gelöscht.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsBulkDeleteOpen(false)}
              disabled={bulkDeleteMutation.isPending}
              className="h-11 rounded-xl border border-[#E2E8F0] px-5 text-sm font-semibold text-[#4A5568] hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => bulkDeleteMutation.mutate([...selectedIds])}
              disabled={bulkDeleteMutation.isPending || selectedIds.size === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleteMutation.isPending ? "Wird gelöscht..." : "Dauerhaft löschen"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
