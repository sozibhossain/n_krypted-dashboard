import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between bg-white rounded-2xl border border-[#F0ECE1] p-5 shadow-xs transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-[#E0F7FA] text-[#0097A7] flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 stroke-[1.75]" />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="text-sm font-medium text-[#718096] max-w-[130px] leading-snug">
          {title}
        </span>
        <span className="text-2xl font-bold text-[#0097A7] tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
}
