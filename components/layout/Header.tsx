"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, User as UserIcon } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard-Übersicht";
    if (pathname.startsWith("/users")) return "Benutzerverwaltung";
    if (pathname.startsWith("/restaurants")) return "Restaurantmanagement";
    if (pathname.startsWith("/reviews")) return "Top-Bewertungen";
    if (pathname.startsWith("/settings")) return "Einstellungen";
    return "Dashboard";
  };

  const userName = user?.name ?? "";
  const userRole =
    user?.role === "admin" ? "Administrator" : user?.role ?? "";
  const userAvatar = user?.avatar || user?.image;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F0ECE1] sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none cursor-pointer"
          aria-label="Menü öffnen"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Admin Profile indicator at top right */}
      <div className="flex items-center gap-3 bg-transparent">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold text-[#1E1E1E] leading-tight">
            {userName || "\u2014"}
          </div>
          <div className="text-xs text-[#718096] capitalize">
            {userRole || "\u2014"}
          </div>
        </div>

        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#CBD5E1] bg-gray-100 shrink-0 flex items-center justify-center">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={userName}
              fill
              className="object-cover"
              sizes="40px"
              priority
              unoptimized={userAvatar.startsWith("blob:")}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
