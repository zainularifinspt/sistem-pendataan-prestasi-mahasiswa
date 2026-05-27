import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-white/40",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-700 border-emerald-300/30",
        warning:
          "border-transparent bg-amber-500/20 text-amber-700 border-amber-300/30",
        info:
          "border-transparent bg-blue-500/20 text-blue-700 border-blue-300/30",
        lokal:
          "border-transparent bg-blue-500/15 text-blue-600 border-blue-300/30",
        nasional:
          "border-transparent bg-amber-500/15 text-amber-700 border-amber-300/30",
        internasional:
          "border-transparent bg-red-500/15 text-red-600 border-red-300/30",
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
