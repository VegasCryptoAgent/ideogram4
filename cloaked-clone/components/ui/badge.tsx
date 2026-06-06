import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-violet-500/30 bg-violet-500/20 text-violet-300",
        secondary:
          "border-white/20 bg-white/10 text-white/80",
        destructive:
          "border-red-500/30 bg-red-500/20 text-red-300",
        success:
          "border-green-500/30 bg-green-500/20 text-green-300",
        warning:
          "border-amber-500/30 bg-amber-500/20 text-amber-300",
        outline:
          "border-white/20 text-white/80 bg-transparent",
        info:
          "border-blue-500/30 bg-blue-500/20 text-blue-300",
        ghost:
          "border-transparent bg-white/5 text-white/70",
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
