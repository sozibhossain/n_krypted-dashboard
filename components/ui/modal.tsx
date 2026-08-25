"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-3xl",
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} my-auto rounded-3xl border border-[#F0ECE1] bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] z-10`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-[#F0ECE1] px-6 py-5 sm:px-8">
            <div className="space-y-1">
              {title && (
                <h2 className="text-lg font-bold text-[#1E1E1E] sm:text-xl">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-[#718096] sm:text-sm">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-[#FFFBE9] hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0097A7]"
              title="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
