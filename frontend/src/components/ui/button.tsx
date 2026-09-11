import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "thermal";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-thermal-400 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants = {
      default:
        "bg-thermal-500 text-white shadow hover:bg-thermal-600 hover:shadow-thermal-500/20",
      destructive:
        "bg-red-500 text-white shadow-sm hover:bg-red-600",
      outline:
        "border border-steel-700 bg-transparent text-steel-200 shadow-sm hover:bg-steel-800 hover:text-white hover:border-steel-600",
      secondary:
        "bg-steel-800 text-steel-100 shadow-sm hover:bg-steel-700",
      ghost: "text-steel-300 hover:bg-steel-800 hover:text-white",
      link: "text-thermal-400 underline-offset-4 hover:underline",
      thermal:
        "bg-gradient-to-r from-thermal-500 to-orange-600 text-white shadow-md hover:from-thermal-600 hover:to-orange-700 hover:shadow-thermal-500/30",
    }[variant];

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base",
      icon: "h-9 w-9",
    }[size];

    return (
      <button
        className={cn(base, variants, sizes, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
