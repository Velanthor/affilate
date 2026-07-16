import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_0_0_1px_rgba(61,92,255,0.4),0_4px_24px_-4px_rgba(61,92,255,0.5)] hover:shadow-[0_0_0_1px_rgba(61,92,255,0.6),0_8px_32px_-4px_rgba(61,92,255,0.65)] hover:brightness-110",
        secondary:
          "bg-white/[0.06] text-foreground border border-white/[0.1] hover:bg-white/[0.1] backdrop-blur-sm",
        outline:
          "border border-white/[0.15] bg-transparent hover:bg-white/[0.05] text-foreground",
        ghost: "hover:bg-white/[0.06] text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary-400 underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-primary-500 via-accent-cyan to-primary-500 bg-[length:200%_auto] text-white animate-gradient-x shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
