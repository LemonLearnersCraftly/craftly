import React from "react";
import "../styles/Articles.css";
import { Card } from "./ui/card";

const Articles = () => {
  const articles = [
    {
      id: 1,
      image: "/article.jpg",
      link: "https://www.lovecrafts.com/en-gb/c/article/how-to-knit-step-by-step",
    },
    {
      id: 2,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
  ];

  return (
    <div className="articles">
      {articles.length > 0 ? (
        articles.map((article) => (
          <Card
            key={article.id}
            className="article bg-primary-200 hover:bg-primary-300 border-border"
          >
            <a href={article.link}>
              <img
                src={article.image}
                className="article-image border border-surface-200"
              />
            </a>
          </Card>
        ))
      ) : (
        <p>No articles available</p> // Display a message if no articles are found
      )}
    </div>
  );
};

export default Articles;
