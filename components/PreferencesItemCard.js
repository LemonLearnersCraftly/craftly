import React from 'react';
import '../styles/Preferences_item_card.css'; // Import your CSS file

export default function PreferencesItemCard({ imageUrl, text, isSelected, onClick }) {
  return (
    <button onClick={onClick} className={`card ${isSelected ? 'selected' : ''}`}>
      <div className="card-info">
        <span className="card-title">{text}</span>
        <img src={imageUrl} alt={text} className="card-image" />
      </div>
    </button>
  );
}