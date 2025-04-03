"use client";

import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { db } from "@/utils/firestore";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { PostSchema, PostConverter } from "@/models/Posts";
import { UserSchema, UserConverter } from "@/models/Users";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(collection(db, "posts"));
        const postsSnapshot = await getDocs(postsQuery);

        console.log("Raw snapshot:", postsSnapshot); // Debug raw snapshot
        console.log("Snapshot docs:", postsSnapshot.docs); // Debug docs array

        // Fetch posts with user information
        const postsData = await Promise.all(
          postsSnapshot.docs.map(async (docSnapshot) => {
            console.log("Raw document data:", docSnapshot.data()); // Debug raw document data
            const postData = PostConverter.fromFirestore(docSnapshot);
            console.log("Converted post data:", postData); // Debug converted data

            // Check if assciateUser exists (note the spelling)
            if (!postData.assciateUser) {
              console.warn(`No assciateUser found for post ${docSnapshot.id}`);
              return {
                ...postData,
                id: docSnapshot.id,
                user: null,
              };
            }

            try {
              // Fetch user information
              const userDoc = await getDoc(
                doc(db, "users", postData.assciateUser)
              );
              const userData = userDoc.exists() ? userDoc.data() : null;
              console.log("User data:", userData); // Debug user data

              return {
                ...postData,
                id: docSnapshot.id,
                user: userData
                  ? {
                      imageUrl:
                        userData.ppic ||
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=90",
                      username: userData.username,
                      firstName: userData.firstName,
                    }
                  : null,
              };
            } catch (userError) {
              console.error(
                `Error fetching user for post ${docSnapshot.id}:`,
                userError
              );
              return {
                ...postData,
                id: docSnapshot.id,
                user: null,
              };
            }
          })
        );

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log(posts);

  return (
    <div className="flex flex-col items-center p-5 h-screen overflow-y-auto gap-5">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          image={post.images[0]}
          description={post.description}
          hasCarousel={post.hasCarousel}
          images={post.images}
          user={post.user}
        />
      ))}
    </div>
  );
};

export default Feed;
