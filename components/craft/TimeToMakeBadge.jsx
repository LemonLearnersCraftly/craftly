import { CraftBadge } from "../ui/craft-badge";
import { Clock } from "lucide-react";

export function TimeToMakeBadge({ time, className }) {
  if (!time) return null;

  return (
    <CraftBadge
      variant="craft"
      className={cn("flex items-center gap-1", className)}
    >
      <Clock className="w-3 h-3" />
      {time}
    </CraftBadge>
  );
}
