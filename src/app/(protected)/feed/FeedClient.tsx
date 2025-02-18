// app/feed/FeedClient.tsx
"use client";

import { useState } from "react";
import Feed from "@/components/Feed";
import Articles from "@/components/Articles";
import "../../../../styles/Homepage.css";

export default function FeedClient({ user }: { user: any }) {
  const [isArticlesHidden, setIsArticlesHidden] = useState(false);

  const handleToggleArticles = () => {
    setIsArticlesHidden(!isArticlesHidden);
  };

  return (
    <div className="homepage">
      <div className="content">
        <div className="feed-section">
          <Feed />
        </div>
        {!isArticlesHidden && (
          <div className="articles-section">
            <Articles />
          </div>
        )}
        <button className="toggle-button" onClick={handleToggleArticles}>
          {isArticlesHidden ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className=""
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className=""
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          )}

          {/* <img
            src={isArticlesHidden ? "/showArticles.jpg" : "/hideArticles.jpg"}
            alt={isArticlesHidden ? "Show articles" : "Hide articles"}
          /> */}
        </button>
      </div>
    </div>
  );
}
