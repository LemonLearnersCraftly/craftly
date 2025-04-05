"use client";

import { cn } from "@/lib/utils";

export function YarnSpinner({ size = "md", color = "yarn" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const colorStyles = {
    yarn: {
      ball: "from-yarn-600 via-yarn-400 to-yarn-200",
      thread: "bg-yarn-500",
    },
    mint: {
      ball: "from-mint-600 via-mint-400 to-mint-200",
      thread: "bg-mint-500",
    },
    sage: {
      ball: "from-sage-600 via-sage-400 to-sage-200",
      thread: "bg-sage-500",
    },
    craft: {
      ball: "from-craft-600 via-craft-400 to-craft-200",
      thread: "bg-craft-500",
    },
    lavender: {
      ball: "from-lavender-600 via-lavender-400 to-lavender-200",
      thread: "bg-lavender-500",
    },
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Yarn ball */}
      <div
        className={cn(
          "absolute inset-0 rounded-full animate-spin-around",
          `bg-gradient-to-tr ${colorStyles[color].ball}`
        )}
      ></div>

      {/* Inner hole */}
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full"></div>

      {/* Thread */}
      <div
        className={cn(
          "absolute top-1 left-1/2 w-1 h-1/3 -translate-x-1/2 origin-bottom",
          colorStyles[color].thread,
          "animate-[wave_2s_ease-in-out_infinite]"
        )}
      ></div>
    </div>
  );
}
