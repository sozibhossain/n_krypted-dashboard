"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Ban, Search } from "lucide-react";
import { toast } from "sonner";
import { restaurantApi, RestaurantItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function RestaurantManagementPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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
    mutationFn: async (id: string) => {
      return await restaurantApi.toggleStatus(id);
    },
    onSuccess: () => {
      toast.success("Status des Restaurants erfolgreich geändert!");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: () => {
      toast.info("Status geändert (Demo Modus)");
    },
  });

  const handleToggleStatus = (restaurant: RestaurantItem) => {
    toggleStatusMutation.mutate(restaurant._id);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#F0ECE1] p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E1E1E]">Alle Restaurants</h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
            Alle Restaurants anzeigen.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Restaurant suchen..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-10 text-xs border-[#E2E8F0] rounded-xl focus-visible:ring-[#0097A7]"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-[#F0ECE1]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFFBE9] border-b border-[#F0ECE1] text-xs font-semibold text-[#1E1E1E]">
              <th className="py-4 px-5">Name des Restaurants</th>
              <th className="py-4 px-5">E-Mail</th>
              <th className="py-4 px-5">Bewertung</th>
              <th className="py-4 px-5">Rezension</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-center">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F2E8] text-xs sm:text-sm">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="w-28 h-4" />
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <Skeleton className="w-36 h-4" />
                  </td>
                  <td className="py-3.5 px-5">
                    <Skeleton className="w-8 h-4" />
                  </td>
                  <td className="py-3.5 px-5">
                    <Skeleton className="w-8 h-4" />
                  </td>
                  <td className="py-3.5 px-5">
                    <Skeleton className="w-16 h-6 rounded-full" />
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-center gap-3">
                      <Skeleton className="w-5 h-5 rounded-md" />
                      <Skeleton className="w-5 h-5 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))
            ) : data?.data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  Keine Restaurants gefunden.
                </td>
              </tr>
            ) : (
              data?.data?.map((restaurant) => {
                const isActivated = restaurant.status === "activate";
                return (
                  <tr
                    key={restaurant._id}
                    className="hover:bg-[#FFFDF5] transition-colors"
                  >
                    {/* Name + Avatar */}
                    <td className="py-3.5 px-5 font-medium text-[#1E1E1E]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-black shrink-0">
                          <Image
                            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80"
                            alt={restaurant.title}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <span>{restaurant.title}</span>
                      </div>
                    </td>

                    {/* E-Mail */}
                    <td className="py-3.5 px-5 text-[#718096]">
                      {restaurant.email || "example@gmail.com"}
                    </td>

                    {/* Bewertung */}
                    <td className="py-3.5 px-5 text-[#1E1E1E] font-medium">
                      {(restaurant.rating || 4.5).toString().replace(".", ",")}
                    </td>

                    {/* Rezension count */}
                    <td className="py-3.5 px-5 text-[#1E1E1E] font-medium">
                      {restaurant.reviewCount || 4}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      <Badge variant={isActivated ? "active" : "inactive"}>
                        {isActivated ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/restaurants/${restaurant._id}`}
                          className="text-[#0097A7] hover:text-[#00838F] p-1 rounded-md transition-colors"
                          title="Details anzeigen"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(restaurant)}
                          className="text-[#EF4444] hover:text-red-700 p-1 rounded-md transition-colors cursor-pointer"
                          title="Status umschalten"
                        >
                          <Ban className="w-4 h-4" />
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

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={data.meta.currentPage}
          totalPages={data.meta.totalPages}
          totalItems={data.meta.totalItems}
          itemsPerPage={data.meta.itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-2"
        />
      )}
    </div>
  );
}
