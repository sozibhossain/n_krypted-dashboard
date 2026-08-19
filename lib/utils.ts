import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return "4. Juni 2026";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "4. Juni 2026";
    const day = d.getDate();
    const months = [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}. ${month} ${year}`;
  } catch {
    return "4. Juni 2026";
  }
}

export function formatTime(dateInput?: string | Date): string {
  if (!dateInput) return "21:30 Uhr";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "21:30 Uhr";
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} Uhr`;
  } catch {
    return "21:30 Uhr";
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    const k = (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1).replace(".", ",");
    return `${k}k`;
  }
  return num.toString();
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2).replace(".", ",")} $`;
}
