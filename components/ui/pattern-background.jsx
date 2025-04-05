import { cn } from "@/lib/utils";

export function PatternBackground({
  className,
  pattern = "dots",
  color = "craft",
  children,
}) {
  const patterns = {
    dots: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23b0a385' fill-opacity='0.15' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
    stitches:
      "url(\"data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h1v1H1V1zm2 2h1v1H3V3zm0-2h1v1H3V1zM1 3h1v1H1V3zm0 2h1v1H1V5zm2 0h1v1H3V5zm0 2h1v1H3V7zM1 7h1v1H1V7zm4-6h1v1H5V1zm2 0h1v1H7V1zM5 3h1v1H5V3zm2 0h1v1H7V3zM5 5h1v1H5V5zm2 0h1v1H7V5zM5 7h1v1H5V7zm2 0h1v1H7V7z' fill='%23b0a385' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E\")",
    weave:
      "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 0h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm3 3h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm3 3h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm3 3h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm-9 3h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm3 0h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm3 0h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm3 0h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm-9-9h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm12 0h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm-3 3h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm-9 6h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5zm12 0h1.5v1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5z' fill='%23b0a385' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E\")",
    paper:
      "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23b0a385' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E\")",
  };

  const colorVariants = {
    craft: "bg-craft-100",
    yarn: "bg-yarn-50",
    mint: "bg-mint-50",
    sage: "bg-sage-50",
    lavender: "bg-lavender-50",
  };

  const style = {
    backgroundImage: patterns[pattern],
  };

  return (
    <div
      className={cn(colorVariants[color], "p-4 rounded-lg", className)}
      style={style}
    >
      {children}
    </div>
  );
}
