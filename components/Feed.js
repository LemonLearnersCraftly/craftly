import React from "react";
import PostCard from "./PostCard";
import "../styles/Feed.css";

const Feed = () => {
  const posts = [
    {
      id: 1,
      image: "/postImage.jpg",
      description: "My way of relaxing on a day off",
    },
    {
      id: 2,
      image: "/postImage.jpg",
      description: "My way of relaxing on a day off",
    },
  ];

  return (
    <div className="feed bg-surface-100">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          image={post.image}
          decription={post.description}
        />
      ))}
    </div>
  );
};

export default Feed;
