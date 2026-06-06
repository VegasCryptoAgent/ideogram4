"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-violet-600 text-white shadow-glow hover:bg-violet-500 hover:shadow-glow-lg active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow hover:bg-red-500 active:scale-[0.98]",
        outline:
          "border border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10 hover:border-white/30 active:scale-[0.98]",
        secondary:
          "bg-white/10 text-white shadow hover:bg-white/15 active:scale-[0.98]",
        ghost:
          "text-white/70 hover:bg-white/10 hover:text-white active:scale-[0.98]",
        link: "text-violet-400 underline-offset-4 hover:underline hover:text-violet-300",
        gradient:
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow hover:from-violet-500 hover:to-indigo-500 hover:shadow-glow-lg active:scale-[0.98]",
        success:
          "bg-green-600 text-white shadow hover:bg-green-500 active:scale-[0.98]",
        warning:
          "bg-amber-600 text-white shadow hover:bg-amber-500 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
