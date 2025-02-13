"use client";

import React, { useEffect, useState } from "react";
import Feed from "../../components/Feed";
import Header from "../../components/Header";
import Articles from "../../components/Articles";
import "../../styles/Homepage.css";
import { getRecentPosts } from "../../utils/firestoreUtils";
import AddItem from "../../components/AddItem";
import {
  useUser,
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";

const HomePage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const result = await getRecentPosts();
      if (result.success) {
        setPosts(result.posts);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="homepage">
      <Header />
      <div className="content">
        <div className="feed-section">
          <Feed posts={posts} />
        </div>
        <div className="articles-section">
          <Articles />
        </div>
      </div>
    </div>
  );
};

// This function will render components for home page
// Work in auth folder for authentication: signin, register, signout
// Work in home folder (Debatable) to create a more specific layout

function Home() {
  const { isSignedIn, user } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Don't render anything until client-side hydration is complete
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 text-white flex justify-between fixed top-0 left-0 z-10">
        <h1 className="text-xl font-bold">MyApp</h1>
        <div>
          {isSignedIn ? (
            <>
              <UserButton />
              <SignOutButton />
            </>
          ) : (
            <>
              <SignInButton />
              <SignUpButton />
            </>
          )}
        </div>
      </nav>

      {/* Add Item */}
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        {isSignedIn ? (
          <>
            <h1 className="text-2xl font-bold text-black">
              Welcome, {user?.firstName} 👋
            </h1>
            <AddItem />
          </>
        ) : (
          <h1 className="text-2xl font-bold text-black">
            Please Sign In to Add Items
          </h1>
        )}
      </div>
    </div>
  );
}

export default HomePage;