import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "thermal" | "emerald" | "cyan";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-thermal-500 text-white shadow hover:bg-thermal-600",
    secondary: "border-steel-700 bg-steel-800 text-steel-200 hover:bg-steel-700",
    destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
    outline: "border-steel-700 text-steel-300",
    thermal: "border-thermal-500/30 bg-thermal-500/10 text-thermal-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
