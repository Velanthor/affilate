import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-white/[0.03] px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors backdrop-blur-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:border-primary-500/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive/60 focus-visible:ring-destructive/40" : "border-white/[0.1]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
