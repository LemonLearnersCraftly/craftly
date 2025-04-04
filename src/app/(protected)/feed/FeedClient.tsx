// src/app/(protected)/feed/FeedClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  query,
  getDocs,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { UserConverter } from "@/models/Users";
import { PostConverter } from "@/models/Posts";
import { PlusCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import postService from "@/utils/postService";

// Define types for our data
interface Post {
  id: string;
  images: string[];
  description?: string;
  assciateUser: string;
  likes: number;
  comments: any[];
  hasCarousel: boolean;
  saved: boolean;
  createdAt?: any;
  username?: string;
  userImage?: string;
}

interface Article {
  id: number;
  image: string;
  link: string;
  title?: string;
  category?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  interests: {
    total: number;
    items: string[];
  };
  following?: any;
  posts?: any;
  imageUrl?: string;
}

export default function FeedClient() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isArticlesHidden, setIsArticlesHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // All available articles
  const allArticles: Article[] = [
    {
      id: 1,
      image: "/article.jpg",
      link: "https://www.lovecrafts.com/en-gb/c/article/how-to-knit-step-by-step",
      title: "How to Knit: Step by Step Guide",
      category: "Knitting",
    },
    {
      id: 2,
      image: "/article2.jpg",
      link: "https://www.handylittleme.com/30-stash-busting-knitting-patterns/",
      title: "30 Stash-Busting Knitting Patterns",
      category: "Knitting",
    },
    {
      id: 3,
      image: "/article3.jpg",
      link: "https://www.redtedart.com/how-to-crochet-beginners-guide-to-teaching-yourself/",
      title: "Beginners Guide to Crochet",
      category: "Crochet",
    },
    {
      id: 4,
      image: "/article4.jpg",
      link: "https://yarnhild.com/crochet-amigurumi-for-beginners/",
      title: "Crochet Amigurumi for Beginners",
      category: "Crochet",
    },
    {
      id: 5,
      image: "/article5.jpg",
      link: "https://blog.treasurie.com/start-stop-seam/",
      title: "Start and Stop Seam Guide",
      category: "Sewing",
    },
    {
      id: 6,
      image: "/article6.jpg",
      link: "https://hellosewing.com/basic-hand-sewing-stitches/",
      title: "Basic Hand Sewing Stitches",
      category: "Sewing",
    },
    {
      id: 7,
      image: "/article7.jpg",
      link: "https://pumora.com/basic-hand-embroidery-stitches/",
      title: "Basic Hand Embroidery Stitches",
      category: "Embroidery",
    },
    {
      id: 8,
      image: "/article8.jpg",
      link: "https://blog.treasurie.com/crochet-stitches/",
      title: "Essential Crochet Stitches",
      category: "Crochet",
    },
    {
      id: 9,
      image: "/article9.jpg",
      link: "https://www.artbeatbox.com/blog/how-to-needle-felt",
      title: "How to Needle Felt",
      category: "Felting",
    },
    {
      id: 10,
      image: "/article10.jpg",
      link: "https://blog.treasurie.com/how-to-macrame/",
      title: "How to Macrame",
      category: "Macrame",
    },
    {
      id: 11,
      image: "/article11.jpg",
      link: "https://www.myfrenchtwist.com/macrame-wallhanging-for-beginners/",
      title: "Macrame Wall Hanging for Beginners",
      category: "Macrame",
    },
    {
      id: 12,
      image: "/article12.jpg",
      link: "https://idealme.com/18-easy-knitting-stitches-can-use-project/",
      title: "18 Easy Knitting Stitches",
      category: "Knitting",
    },
    {
      id: 13,
      image: "/article13.jpg",
      link: "https://blog.treasurie.com/how-to-cast-on/",
      title: "How to Cast On in Knitting",
      category: "Knitting",
    },
    {
      id: 14,
      image: "/article14.jpg",
      link: "https://crewelghoul.com/blog/free-beginner-embroidery-patterns/",
      title: "Free Beginner Embroidery Patterns",
      category: "Embroidery",
    },
    {
      id: 15,
      image: "/article15.jpg",
      link: "https://www.polkadotchair.com/45-beginner-quilt-patterns-tutorials/",
      title: "45 Beginner Quilt Patterns",
      category: "Quilting",
    },
    {
      id: 16,
      image: "/article16.jpg",
      link: "https://www.sumoftheirstories.com/blog/easy-sewing-projects-that-are-perfect-for-beginners",
      title: "Easy Sewing Projects for Beginners",
      category: "Sewing",
    },
    {
      id: 17,
      image: "/article17.jpg",
      link: "https://needlepoint-for-fun.com/pages/how-to-needlepoint",
      title: "How to Needlepoint",
      category: "Needlepoint",
    },
    {
      id: 18,
      image: "/article18.jpg",
      link: "https://cross-stitch.craftgossip.com/30-bird-cross-stitch-patterns/2022/12/07/",
      title: "30 Bird Cross Stitch Patterns",
      category: "Cross Stitch",
    },
    {
      id: 19,
      image: "/article19.jpg",
      link: "https://studio-koekoek.com/cross-stitch-instructions-tutorial-for-beginners/",
      title: "Cross Stitch for Beginners",
      category: "Cross Stitch",
    },
    {
      id: 20,
      image: "/article20.jpg",
      link: "https://www.allfreejewelrymaking.com/Jewelry-Basics/Beginner-Beading-Tutorials-How-to-Peyote-Stitch-Brick-Stitch-Square-Stitch-and-More",
      title: "Beginner Beading Tutorials",
      category: "Jewelery Making",
    },
  ];

  // Color map for interests
  const interestColorMap: { [key: string]: string } = {
    Knitting: "bg-blue-500",
    Crochet: "bg-purple-500",
    Embroidery: "bg-pink-500",
    "Paper Crafts": "bg-yellow-500",
    Ceramics: "bg-amber-600",
    Felting: "bg-green-600",
    Sewing: "bg-red-500",
    "Jewelery Making": "bg-indigo-500",
    "Candle Making": "bg-lime-500",
    Macrame: "bg-cyan-500",
    Quilting: "bg-orange-500",
    "Cross Stitch": "bg-violet-500",
    Needlepoint: "bg-teal-500",
  };

  // Handle toggle articles section
  const handleToggleArticles = () => {
    setIsArticlesHidden(!isArticlesHidden);
  };

  // Function to like a post
  const handleLikePost = async (postId: string) => {
    // Find the post and increment its likes
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );

    // TODO: Update the likes in Firestore
    // This would be implemented with a function to update the post in the database
  };

  // Load user data
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.id).withConverter(
          UserConverter
        );
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          // Add Clerk user image to our user data
          setUserData({
            ...userData,
            imageUrl: user.imageUrl,
          });

          // Filter articles based on user interests
          if (userData.interests?.items?.length > 0) {
            // Simple filtering logic based on matching categories to interests
            const filtered = allArticles.filter((article) =>
              userData.interests.items.some(
                (interest) =>
                  article.category?.includes(interest) ||
                  interest.includes(article.category || "")
              )
            );

            setFilteredArticles(filtered.length > 0 ? filtered : allArticles);
          } else {
            setFilteredArticles(allArticles);
          }
        } else {
          console.log("No user data found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, isLoaded]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Use PostService to fetch posts for feed
        const { posts: postsData } = await postService.getFeedPosts(
          user.id,
          null,
          20
        );
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchPosts();
    }
  }, [isLoaded, user]);

  // Set articles
  useEffect(() => {
    setArticles(allArticles);
    // Filter will be done after user data loads
  }, []);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-mint"></div>
      </div>
    );
  }

  // Mock create post modal - This would be expanded into a full component
  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-custom-sage">
            Create New Post
          </h2>
          <button
            onClick={() => setShowCreatePost(false)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 mb-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-gray-600 mb-2">Drag and drop photos here</p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <button className="bg-custom-mint hover:bg-custom-sage text-white font-medium py-2 px-4 rounded-lg transition">
                Browse Files
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-mint"
              rows={4}
              placeholder="Share details about your craft..."
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Tags
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-mint"
              placeholder="Add tags separated by commas (e.g., knitting, wool, sweater)"
            />
          </div>

          <div className="flex justify-between">
            <button
              className="border border-custom-mint text-custom-mint px-4 py-2 rounded-lg hover:bg-custom-mint hover:text-white transition"
              onClick={() => setShowCreatePost(false)}
            >
              Save as Draft
            </button>
            <ShimmerButton onClick={() => setShowCreatePost(false)}>
              <span className="font-medium">Post Now</span>
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Add Post Button - Fixed at bottom right on mobile, top right on desktop */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 right-6 md:bottom-auto md:top-20 z-30 bg-custom-mint text-white rounded-full p-3 shadow-lg hover:bg-custom-sage transition-colors"
        aria-label="Create new post"
      >
        <PlusCircle size={24} />
      </button>

      {/* Create Post Modal */}
      {showCreatePost && <CreatePostModal />}

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Section - Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <img
                    src={userData?.imageUrl || "/profile-placeholder.jpg"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-custom-mint mb-4"
                  />
                  <h2 className="text-xl font-bold">
                    {userData?.username || "Crafter"}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    @
                    {userData?.username?.toLowerCase().replace(/\s/g, "") ||
                      "crafter"}
                  </p>

                  <div className="w-full border-t border-gray-100 my-4 pt-4">
                    <h3 className="font-medium text-gray-700 mb-2">
                      My Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userData?.interests?.items?.map((interest, index) => (
                        <span
                          key={index}
                          className={`${
                            interestColorMap[interest] || "bg-gray-500"
                          } text-white text-xs px-2 py-1 rounded-full`}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href="/profile" className="w-full">
                    <Button variant="outline" className="w-full mt-4">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feed - Middle */}
          <div className="lg:col-span-6">
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-12 bg-gray-200"></div>
                    <div className="h-96 bg-gray-300"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center">
                      <Link
                        href={`/profile/${post.assciateUser}`}
                        className="flex items-center"
                      >
                        <img
                          src={post.userImage || "/profile-placeholder.jpg"}
                          alt={post.username || "User"}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium">
                            {post.username || "Crafter"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Craftly Creator
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Post Image */}
                    <div className="relative">
                      <img
                        src={post.images[0] || "/post-placeholder.jpg"}
                        alt="Post"
                        className="w-full aspect-square object-cover"
                      />

                      {/* If has multiple images */}
                      {post.hasCarousel && post.images.length > 1 && (
                        <div className="absolute inset-0 flex justify-between items-center px-4">
                          <button className="bg-white rounded-full p-1 shadow-md">
                            <ChevronLeft size={20} />
                          </button>
                          <button className="bg-white rounded-full p-1 shadow-md">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="p-4">
                      <div className="flex space-x-4 mb-3">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-1 text-gray-700 hover:text-custom-sage transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-700 hover:text-custom-sage transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-700 hover:text-custom-sage transition ml-auto">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                        </button>
                        <button className="flex items-center gap-1 text-gray-700 hover:text-custom-sage transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </button>
                      </div>

                      {/* Post Caption */}
                      <p className="text-gray-800">
                        <span className="font-medium">
                          {post.username || "Crafter"}{" "}
                        </span>
                        {post.description ||
                          "Check out my latest craft project! #craftly #create"}
                      </p>

                      {/* Comments */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>View all {post.comments.length} comments</p>
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="mt-3 flex">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-custom-mint"
                        />
                        <button className="ml-2 text-custom-mint font-medium text-sm">
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-gray-400 mb-4"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Posts Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Follow some crafters or create your first post
                </p>
                <Button
                  className="bg-custom-mint hover:bg-custom-sage text-white"
                  onClick={() => setShowCreatePost(true)}
                >
                  Create Post
                </Button>
              </div>
            )}
          </div>

          {/* Articles Section - Right Sidebar */}
          <div
            className={`lg:col-span-3 transition-all duration-300 ${
              isArticlesHidden ? "lg:hidden" : ""
            }`}
          >
            <div className="bg-white rounded-xl shadow-md sticky top-20">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-bold text-lg text-custom-sage">
                  Craft Inspiration
                </h2>
                <button
                  onClick={handleToggleArticles}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 max-h-[calc(100vh-150px)] overflow-y-auto">
                {filteredArticles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredArticles.slice(0, 6).map((article) => (
                      <a
                        key={article.id}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        <img
                          src={article.image}
                          alt={article.title || "Article"}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-800 line-clamp-2">
                            {article.title || "Craft Article"}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {article.category || "Crafts"}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    No articles found for your interests
                  </p>
                )}

                <div className="mt-4 text-center">
                  <a
                    href="#"
                    className="text-custom-mint hover:text-custom-sage text-sm font-medium"
                  >
                    View All Articles
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Articles Button (Mobile Only) */}
          {isArticlesHidden && (
            <button
              onClick={handleToggleArticles}
              className="fixed bottom-6 left-6 z-30 lg:hidden bg-white text-custom-sage rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Show articles"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
