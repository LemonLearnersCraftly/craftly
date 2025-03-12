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
    {
      id: 3,
      image: "/article3.jpg",
      link: "https://www.redtedart.com/how-to-crochet-beginners-guide-to-teaching-yourself/",
    },
    {
      id: 4,
      image: "/article4.jpg",
      link: "https://yarnhild.com/crochet-amigurumi-for-beginners/",
    },
    {
      id: 5,
      image: "/article5.jpg",
      link: "https://blog.treasurie.com/start-stop-seam/",
    },
    {
      id: 6,
      image: "/article6.jpg",
      link: "https://hellosewing.com/basic-hand-sewing-stitches/",
    },
    {
      id: 7,
      image: "/article7.jpg",
      link: "https://pumora.com/basic-hand-embroidery-stitches/",
    },
    {
      id: 8,
      image: "/article8.jpg",
      link: "https://blog.treasurie.com/crochet-stitches/",
    },
    {
      id: 9,
      image: "/article9.jpg",
      link: "https://www.artbeatbox.com/blog/how-to-needle-felt",
    },
    {
      id: 10,
      image: "/article10.jpg",
      link: "https://blog.treasurie.com/how-to-macrame/",
    },
    {
      id: 11,
      image: "/article11.jpg",
      link: "https://www.myfrenchtwist.com/macrame-wallhanging-for-beginners/",
    },
    {
      id: 12,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 13,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 14,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 15,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 16,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 17,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 18,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 19,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    },
    {
      id: 20,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
    }
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
