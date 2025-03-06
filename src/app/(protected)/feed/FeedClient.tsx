// app/feed/FeedClient.tsx
"use client";

import { useState, useEffect } from "react";
import Feed from "@/components/Feed";
import Articles from "@/components/Articles";
import { Menu } from "lucide-react";

export default function FeedClient({ user }: { user: any }) {
  const [isArticlesHidden, setIsArticlesHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleArticles = () => {
    setIsArticlesHidden(!isArticlesHidden);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-[1600px] mx-auto min-h-screen flex relative">
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isArticlesHidden ? "w-full" : "w-[calc(100%-320px)]"
          }`}
        >
          <div
            className={`px-4 py-6 ${
              isArticlesHidden
                ? "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                : ""
            }`}
          >
            <Feed />
          </div>
        </div>
        {!isArticlesHidden && (
          <div className="w-[320px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg">
            <Articles />
          </div>
        )}
        <button
          className={`absolute top-6 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out z-50 border border-black dark:border-gray-700 ${
            isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
          } ${isArticlesHidden ? "right-4" : "right-[320px]"}`}
          onClick={handleToggleArticles}
          aria-label={isArticlesHidden ? "Show articles" : "Hide articles"}
        >
          {isArticlesHidden ? (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>
    </div>
  );
}
