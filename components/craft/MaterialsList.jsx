import { CraftBadge } from "../ui/craft-badge";
import {
  Scissors,
  PaintBucket,
  Paintbrush,
  PenTool,
  Needle,
} from "lucide-react";

// Icons for specific materials
const materialIcons = {
  yarn: <Scissors className="w-3 h-3 mr-1" />,
  fabric: <Scissors className="w-3 h-3 mr-1" />,
  paint: <PaintBucket className="w-3 h-3 mr-1" />,
  brush: <Paintbrush className="w-3 h-3 mr-1" />,
  paper: <PenTool className="w-3 h-3 mr-1" />,
  thread: <Needle className="w-3 h-3 mr-1" />,
  // Add more material icons as needed
};

export function MaterialsList({ materials = [], className }) {
  if (!materials || materials.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-2">Materials</h4>
      <div className="flex flex-wrap gap-2">
        {materials.map((material, index) => {
          // Look for keywords in the material to determine which icon to show
          const icon = Object.entries(materialIcons).find(([key]) =>
            material.toLowerCase().includes(key)
          );

          return (
            <CraftBadge
              key={index}
              variant="craft"
              className="flex items-center"
            >
              {icon ? icon[1] : null}
              {material}
            </CraftBadge>
          );
        })}
      </div>
    </div>
  );
}
