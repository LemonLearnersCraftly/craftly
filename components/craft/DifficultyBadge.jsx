import { CraftBadge } from "../ui/craft-badge";

export function DifficultyBadge({ level = "beginner", className }) {
  const variants = {
    beginner: {
      variant: "mint",
      label: "Beginner",
    },
    intermediate: {
      variant: "sage",
      label: "Intermediate",
    },
    advanced: {
      variant: "yarn",
      label: "Advanced",
    },
    expert: {
      variant: "lavender",
      label: "Expert",
    },
  };

  const { variant, label } = variants[level.toLowerCase()] || variants.beginner;

  return (
    <CraftBadge variant={variant} className={className}>
      {label}
    </CraftBadge>
  );
}
