// components/ui/craft-card.jsx
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const CraftCard = forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white dark:bg-gray-800 shadow-md",
      paper: "bg-paper shadow-md",
      stitched: "panel-stitched",
      elevated:
        "bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
CraftCard.displayName = "CraftCard";

const CraftCardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CraftCardHeader.displayName = "CraftCardHeader";

const CraftCardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CraftCardTitle.displayName = "CraftCardTitle";

const CraftCardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CraftCardDescription.displayName = "CraftCardDescription";

const CraftCardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CraftCardContent.displayName = "CraftCardContent";

const CraftCardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CraftCardFooter.displayName = "CraftCardFooter";

export {
  CraftCard,
  CraftCardHeader,
  CraftCardFooter,
  CraftCardTitle,
  CraftCardDescription,
  CraftCardContent,
};
