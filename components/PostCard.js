import React from "react";
import "../styles/PostCard.css";
import { Heart, MessageCircle } from "lucide-react";

// components/PostCard.js
const PostCard = ({ image, description }) => {
  return (
    <div className="post-card bg-surface-50 border border-surface-200 rounded-[var(--radius)]">
      <img
        src={image}
        className="post-image rounded-[var(--radius)] border border-surface-200"
      />
      <div className="post-description text-foreground/80">
        {description || "Default description"}
      </div>
      <div className="post-actions">
        <button className="text-accent-500 hover:text-accent-400">
          <Heart className="size-5 fill-transparent stroke-current" />
        </button>
        <button className=" text-accent-500 hover:text-accent-400">
          <MessageCircle className="size-5 stroke-current" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
