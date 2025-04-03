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
      <button className="toggle-button" onClick={handleToggleArticles}>
        <img
          src={isArticlesHidden ? "/showArticles.jpg" : "/hideArticles.jpg"}
          alt={isArticlesHidden ? "Show articles" : "Hide articles"}
        />
      </button>
    </div>
    </div>
  );
}
