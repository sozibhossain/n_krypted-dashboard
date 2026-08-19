import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097A7] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#0097A7] text-white shadow-sm hover:bg-[#00838F] font-semibold",
        destructive:
          "border border-[#EF4444] text-[#EF4444] bg-white hover:bg-red-50 font-medium",
        outline:
          "border border-[#E2E8F0] bg-white hover:bg-zinc-50 text-[#1E1E1E]",
        secondary:
          "bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB]",
        ghost: "hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600",
        link: "text-[#0097A7] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
