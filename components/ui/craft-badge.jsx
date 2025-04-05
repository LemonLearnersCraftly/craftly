import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Craft variants
        yarn: "border-transparent bg-yarn-100 text-yarn-800 hover:bg-yarn-200",
        mint: "border-transparent bg-mint-100 text-mint-800 hover:bg-mint-200",
        sage: "border-transparent bg-sage-100 text-sage-800 hover:bg-sage-200",
        craft:
          "border-transparent bg-craft-100 text-craft-800 hover:bg-craft-200",
        lavender:
          "border-transparent bg-lavender-100 text-lavender-800 hover:bg-lavender-200",
        stitched:
          "border-2 border-dashed bg-white text-craft-800 hover:bg-gray-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function CraftBadge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { CraftBadge, badgeVariants };
