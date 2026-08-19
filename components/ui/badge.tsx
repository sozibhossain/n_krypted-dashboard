import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        active:
          "border border-[#22C55E] text-[#22C55E] bg-white",
        inactive:
          "border border-[#F97316] text-[#F97316] bg-white",
        sd: "bg-red-500 text-white font-semibold px-2 py-0.5 text-[11px]",
        default:
          "border-transparent bg-[#0097A7] text-white",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-900",
        outline: "text-zinc-950 border border-zinc-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
