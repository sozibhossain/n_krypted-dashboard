"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage, userApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["users", currentPage, searchQuery],
    queryFn: () =>
      userApi.getAllUsers({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      }),
  });
  const selectableIds =
    data?.data.filter((user) => user.role !== "admin").map((user) => user._id) ?? [];
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.bulkDeleteUsers(ids),
    onSuccess: (result) => {
      setSelectedIds(new Set());
      setCurrentPage(1);
      toast.success(`${result.deletedCount} Benutzer wurden gel\u00f6scht.`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) =>
      toast.error(
        getApiErrorMessage(error, "Die Benutzer konnten nicht gel\u00f6scht werden.")
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
      if (allSelected) selectableIds.forEach((id) => next.delete(id));
      else selectableIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    if (
      ids.length > 0 &&
      window.confirm(
        `${ids.length} ausgew\u00e4hlte Benutzer dauerhaft l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.`
      )
    ) {
      bulkDeleteMutation.mutate(ids);
    }
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

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>
                {bulkDeleteMutation.isPending
                  ? "Wird gelöscht..."
                  : `${selectedIds.size} löschen`}
              </span>
            </button>
          )}
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
              setSelectedIds(new Set());
            }}
            className="pl-9 h-10 text-xs border-[#E2E8F0] rounded-xl focus-visible:ring-[#0097A7]"
          />
        </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-[#F0ECE1]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFFBE9] border-b border-[#F0ECE1] text-xs font-semibold text-[#1E1E1E]">
              <th className="py-4 pl-5 pr-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleCurrentPage}
                  disabled={selectableIds.length === 0}
                  aria-label="Alle Benutzer auf dieser Seite ausw\u00e4hlen"
                  className="h-4 w-4 accent-[#0097A7]"
                />
              </th>
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
                  <td className="py-3.5 pl-5 pr-2">
                    <Skeleton className="h-4 w-4" />
                  </td>
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
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  Keine Benutzer gefunden.
                </td>
              </tr>
            ) : (
              data?.data?.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-[#FFFDF5] transition-colors"
                >
                  <td className="py-3.5 pl-5 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user._id)}
                      onChange={() => toggleSelected(user._id)}
                      disabled={user.role === "admin"}
                      aria-label={`${user.name} ausw\u00e4hlen`}
                      title={
                        user.role === "admin"
                          ? "Administratorkonten sind gesch\u00fctzt"
                          : undefined
                      }
                      className="h-4 w-4 accent-[#0097A7] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </td>
                  {/* Name + Avatar */}
                  <td className="py-3.5 px-5 font-medium text-[#1E1E1E]">
                    <div className="flex items-center gap-3">
                      <div className="relative flex w-8 h-8 items-center justify-center rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>

                  {/* E-Mail */}
                  <td className="py-3.5 px-5 text-[#718096]">{user.email}</td>

                  {/* Einchecken count */}
                  <td className="py-3.5 px-5 text-[#1E1E1E] font-medium">
                    {user.checkInCount}
                  </td>

                  {/* Rezension count */}
                  <td className="py-3.5 px-5 text-[#1E1E1E] font-medium">
                    {user.reviewCount}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={user.status === "Inaktiv" ? "inactive" : "active"}
                    >
                      {user.status}
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
