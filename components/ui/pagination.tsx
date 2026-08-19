"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages: (number | string)[] = [];
  const maxDisplayed = 5;

  if (totalPages <= maxDisplayed) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-[#718096]",
        className
      )}
    >
      <div>
        Ergebnisse {startItem} bis {endItem} von {totalItems} werden angezeigt
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#718096] hover:bg-[#F8F9FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Vorherige Seite"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#BDBDBD] text-white border border-[#BDBDBD]"
                  : "bg-white text-[#718096] border border-[#E2E8F0] hover:bg-[#F8F9FA]"
              )}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#718096] hover:bg-[#F8F9FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Nächste Seite"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
