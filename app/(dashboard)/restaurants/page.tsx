"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Eye, Search, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage, RestaurantItem, restaurantApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantManagementPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data, isLoading } = useQuery({
    queryKey: ["restaurants", currentPage, searchQuery],
    queryFn: () =>
      restaurantApi.getAllRestaurants({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      }),
  });
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => restaurantApi.toggleStatus(id),
    onSuccess: () => {
      toast.success("Status des Restaurants erfolgreich ge\u00e4ndert!");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: () =>
      toast.error("Der Restaurantstatus konnte nicht ge\u00e4ndert werden."),
  });

  const handleToggleStatus = (restaurant: RestaurantItem) => {
    toggleStatusMutation.mutate(restaurant._id);
  };
  const currentPageIds = data?.data.map((restaurant) => restaurant._id) ?? [];
  const allSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => restaurantApi.bulkDeleteRestaurants(ids),
    onSuccess: (result) => {
      setSelectedIds(new Set());
      setCurrentPage(1);
      toast.success(`${result.deletedCount} Restaurants wurden gel\u00f6scht.`);
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-reviews"] });
    },
    onError: (error: unknown) =>
      toast.error(
        getApiErrorMessage(error, "Die Restaurants konnten nicht gel\u00f6scht werden.")
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
        `${ids.length} ausgew\u00e4hlte Restaurants dauerhaft l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.`
      )
    ) {
      bulkDeleteMutation.mutate(ids);
    }
  };

  return (
    <div className="rounded-3xl border border-[#F0ECE1] bg-white p-6 shadow-xs sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-[#1E1E1E]">Alle Restaurants</h2>
          <p className="mt-0.5 text-xs text-[#718096] sm:text-sm">
            Alle Restaurants anzeigen.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleteMutation.isPending
                ? "Wird gel\u00f6scht..."
                : `${selectedIds.size} l\u00f6schen`}
            </button>
          )}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Restaurant suchen..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
              setSelectedIds(new Set());
            }}
            className="h-10 rounded-xl border-[#E2E8F0] pl-9 text-xs focus-visible:ring-[#0097A7]"
          />
        </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#F0ECE1]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#F0ECE1] bg-[#FFFBE9] text-xs font-semibold text-[#1E1E1E]">
              <th className="py-4 pl-5 pr-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleCurrentPage}
                  disabled={currentPageIds.length === 0}
                  aria-label="Alle Restaurants auf dieser Seite ausw\u00e4hlen"
                  className="h-4 w-4 accent-[#0097A7]"
                />
              </th>
              <th className="px-5 py-4">Name des Restaurants</th>
              <th className="px-5 py-4">Standort</th>
              <th className="px-5 py-4">Bewertung</th>
              <th className="px-5 py-4">Rezension</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F2E8] text-xs sm:text-sm">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 7 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-3.5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  Keine Restaurants gefunden.
                </td>
              </tr>
            ) : (
              data?.data.map((restaurant) => {
                const isActivated = restaurant.status === "activate";
                const location = [
                  restaurant.location?.city,
                  restaurant.location?.country,
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <tr key={restaurant._id} className="transition-colors hover:bg-[#FFFDF5]">
                    <td className="py-3.5 pl-5 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(restaurant._id)}
                        onChange={() => toggleSelected(restaurant._id)}
                        aria-label={`${restaurant.title} ausw\u00e4hlen`}
                        className="h-4 w-4 accent-[#0097A7]"
                      />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#1E1E1E]">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                          {restaurant.images[0] ? (
                            <Image
                              src={restaurant.images[0]}
                              alt={restaurant.title}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <Utensils className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <span>{restaurant.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#718096]">{location || "\u2014"}</td>
                    <td className="px-5 py-3.5 font-medium text-[#1E1E1E]">
                      {restaurant.rating.toFixed(1).replace(".", ",")}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#1E1E1E]">
                      {restaurant.reviewCount}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={isActivated ? "active" : "inactive"}>
                        {isActivated ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/restaurants/${restaurant._id}`}
                          className="rounded-md p-1 text-[#0097A7] transition-colors hover:text-[#00838F]"
                          title="Details anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(restaurant)}
                          disabled={toggleStatusMutation.isPending}
                          className="cursor-pointer rounded-md p-1 text-[#EF4444] transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Status umschalten"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
          className="mt-2"
        />
      )}
    </div>
  );
}
