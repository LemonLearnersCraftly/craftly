// app/feed/FeedClient.tsx
"use client";

import { useState } from "react";
import Feed from "@/components/Feed";
import Articles from "@/components/Articles";
import ProfileSnippet from "@/components/ProfileSnippet";
import "../../../../styles/Homepage.css";

export default function FeedClient({ user }: { user: any }) {
  const [isArticlesHidden, setIsArticlesHidden] = useState(false);

  const handleToggleArticles = () => {
    setIsArticlesHidden(!isArticlesHidden);
  };

  return (
    <div className="homepage">

    <div className="content">
      <div className="profile-section">
        <ProfileSnippet />  
      </div>
      <div className="feed-section">
        <Feed />
      </div>
      {!isArticlesHidden && (
        <div className="articles-section">
          <Articles />
        </div>
      )}
      <label className="switch">
        <input
          className="toggle"
          type="checkbox"
          checked={isArticlesHidden}
          onChange={handleToggleArticles}
        />
        <span className="slider"></span>
        <span className="card-side"></span>
      </label>
    </div>
    </div>
  );
}
