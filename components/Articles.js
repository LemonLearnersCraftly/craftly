import React from "react";
import { BookOpen } from "lucide-react";

const Articles = () => {
  const articles = [
    {
      id: 1,
      image: "/article.jpg",
      title: "How to Knit: A Step-by-Step Guide for Beginners",
      author: "Sarah Johnson",
      link: "https://www.lovecrafts.com/en-gb/c/article/how-to-knit-step-by-step",
      readTime: "5 min read",
    },
    {
      id: 2,
      image: "/article2.jpg",
      title: "30 Stash-Busting Knitting Patterns You'll Love",
      author: "Emma Wilson",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
      readTime: "8 min read",
    },
  ];

  return (
    <div className="sticky top-0">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Recommended Articles</h2>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <a
              key={article.id}
              href={article.link}
              className="block group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="relative h-32">
                  <img
                    src={article.image}
                    className="w-full h-full object-cover"
                    alt={article.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>By {article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>No articles available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
