import React from "react";
import "../styles/Articles.css";

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
          <div key={article.id} className="article">
            <a href={article.link}>
              <img src={article.image} className="article-image" />
            </a>
          </div>
        ))
      ) : (
        <p>No articles available</p> // Display a message if no articles are found
      )}
    </div>
  );
};

export default Articles;
