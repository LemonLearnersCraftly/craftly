import { cn } from "@/lib/utils";

export function StitchDivider({
  className,
  orientation = "horizontal",
  color = "craft",
}) {
  const colorClasses = {
    craft: "border-craft-400",
    mint: "border-mint-400",
    sage: "border-sage-400",
    yarn: "border-yarn-400",
    lavender: "border-lavender-400",
  };

  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          "w-full my-4 h-[2px] border-t-2 border-dashed",
          colorClasses[color],
          className
        )}
      />
    );
  } else {
    return (
      <div
        className={cn(
          "h-full mx-4 w-[2px] border-l-2 border-dashed",
          colorClasses[color],
          className
        )}
      />
    );
  }
}
