// /components/PreferencesItemCard.tsx
import React from "react";
import "../styles/Preferences_item_card.css"; // Check path

// Define prop types
interface PreferencesItemCardProps {
  imageUrl: string;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function PreferencesItemCard({
  imageUrl,
  text,
  isSelected,
  onClick,
}: PreferencesItemCardProps) {
  // Apply types
  return (
    // Use button type="button" for clarity unless it's submitting a form
    <button
      type="button"
      onClick={onClick}
      className={`card ${isSelected ? "selected" : ""}`}
    >
      {/* Card structure remains the same */}
      <div className="card-info">
        <span className="card-title">{text}</span>
        <img src={imageUrl} alt={text} className="card-image" />
      </div>
    </button>
  );
}
