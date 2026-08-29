"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck2, MapPin, Search, Users } from "lucide-react";
import { checkInApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatDate, formatTime, formatNumber } from "@/lib/utils";

export default function CheckInsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role === "restaurant_owner" ? "restaurant_owner" : "admin";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["check-ins", role, page],
    queryFn: () => checkInApi.getAll(role, { page, limit }),
    enabled: Boolean(session?.user),
  });

  const visibleCheckIns = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data?.data ?? [];
    return (data?.data ?? []).filter((item) =>
      [item.userId?.name, item.userId?.email, item.restaurantName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [data?.data, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E1E1E]">Verifizierte Check-ins</h1>
        <p className="mt-1 text-sm text-[#718096]">
          {role === "restaurant_owner"
            ? "Hier siehst du ausschließlich Besuche in deinem Restaurant."
            : "Hier siehst du die standortgeprüften Besuche aller Restaurants."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Check-ins gesamt"
          value={formatNumber(data?.stats.total ?? 0)}
          icon={MapPin}
        />
        <StatCard
          title="Check-ins heute"
          value={formatNumber(data?.stats.today ?? 0)}
          icon={CalendarCheck2}
        />
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#F0ECE1] bg-white shadow-xs">
        <div className="border-b border-[#F0ECE1] p-5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nutzer, E-Mail oder Restaurant suchen"
              className="pl-11"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-red-600">
            Check-ins konnten nicht geladen werden.
          </div>
        ) : visibleCheckIns.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#718096]">
            Keine Check-ins gefunden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#FAFAF7] text-xs uppercase tracking-wide text-[#718096]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nutzer</th>
                  <th className="px-5 py-4 font-semibold">Restaurant</th>
                  <th className="px-5 py-4 font-semibold">Zeitpunkt</th>
                  <th className="px-5 py-4 font-semibold">Personen</th>
                  <th className="px-5 py-4 font-semibold">Entfernung</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {visibleCheckIns.map((item) => (
                  <tr key={item._id} className="text-[#2D3748] hover:bg-[#FAFAF7]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E0F7FA]">
                          {item.userId?.avatar ? (
                            <Image src={item.userId.avatar} alt="" fill className="object-cover" sizes="36px" />
                          ) : (
                            <Users className="h-4 w-4 text-[#0097A7]" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1E1E1E]">{item.userId?.name ?? "—"}</div>
                          <div className="text-xs text-[#718096]">{item.userId?.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#1E1E1E]">{item.restaurantName ?? "—"}</div>
                      <div className="max-w-56 truncate text-xs text-[#718096]">{item.restaurantLocation ?? "—"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div>{formatDate(item.checkedInAt)}</div>
                      <div className="text-xs text-[#718096]">{formatTime(item.checkedInAt)}</div>
                    </td>
                    <td className="px-5 py-4">{item.partySize}</td>
                    <td className="px-5 py-4">{Math.round(item.distanceMeters)} m</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Verifiziert
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.meta && (
          <Pagination
            currentPage={data.meta.currentPage}
            totalPages={data.meta.totalPages}
            totalItems={data.meta.totalItems}
            itemsPerPage={data.meta.itemsPerPage}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
