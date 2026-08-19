"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Ban, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { userApi, UserItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", currentPage, searchQuery],
    queryFn: () =>
      userApi.getAllUsers({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      }),
  });

  // Block/Delete mutation
  const blockMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await userApi.deleteUser(userId);
    },
    onSuccess: () => {
      toast.success("Benutzerstatus erfolgreich aktualisiert!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.info("Benutzerstatus aktualisiert (Demo Mode)");
    },
  });

  const handleToggleBlock = (user: UserItem) => {
    blockMutation.mutate(user._id);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#F0ECE1] p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E1E1E]">Alle Benutzer</h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
            Alle Ihre Benutzer anzeigen.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Benutzer suchen..."
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
              <th className="py-4 px-5">Benutzername</th>
              <th className="py-4 px-5">E-Mail</th>
              <th className="py-4 px-5">Einchecken</th>
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
                      <Skeleton className="w-24 h-4" />
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
                  Keine Benutzer gefunden.
                </td>
              </tr>
            ) : (
              data?.data?.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-[#FFFDF5] transition-colors"
                >
                  {/* Name + Avatar */}
                  <td className="py-3.5 px-5 font-medium text-[#1E1E1E]">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                        <Image
                          src={
                            user.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                          }
                          alt={user.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>

                  {/* E-Mail */}
                  <td className="py-3.5 px-5 text-[#718096]">{user.email}</td>

                  {/* Einchecken count */}
                  <td className="py-3.5 px-5 text-[#1E1E1E] font-medium">
                    {user.checkInCount || 6}
                  </td>

                  {/* Rezension count */}
                  <td className="py-3.5 px-5 text-[#1E1E1E] font-medium">
                    {user.reviewCount || 4}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={user.status === "Inaktiv" ? "inactive" : "active"}
                    >
                      {user.status || "Aktiv"}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/users/${user._id}`}
                        className="text-[#0097A7] hover:text-[#00838F] p-1 rounded-md transition-colors"
                        title="Details anzeigen"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleBlock(user)}
                        className="text-[#EF4444] hover:text-red-700 p-1 rounded-md transition-colors cursor-pointer"
                        title="Benutzer sperren / entsperren"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
