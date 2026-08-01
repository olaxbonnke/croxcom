import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

export function Logo({ size = "md", showText = true, className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 font-mono", className)} {...props}>
      <img
        src="/logo.svg"
        alt="CroxCom Logo"
        className={cn(
          "object-contain rounded-md transition-transform group-hover:scale-105",
          sizeMap[size],
        )}
      />
      {showText && (
        <span className="font-mono font-bold tracking-tight text-foreground text-base">
          <span className="text-muted-foreground">{"> "}</span>
          croxcom<span className="text-primary animate-pulse">_</span>
        </span>
      )}
    </div>
  );
}
