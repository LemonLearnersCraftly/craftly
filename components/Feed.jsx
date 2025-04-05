"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import { db } from "@/utils/firestore";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  where,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Filter, Users, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const POSTS_PER_PAGE = 5;

export default function EnhancedFeed() {
  const { user, isSignedIn } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState("forYou");
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userFollowing, setUserFollowing] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Get user following and interests
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.id));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Set user following
          if (userData.following && userData.following.items) {
            const followingIds = userData.following.items.map(
              (item) => item.followRef
            );
            setUserFollowing(followingIds);
          }

          // Set user interests
          if (userData.interests && userData.interests.items) {
            const interests = userData.interests.items.map(
              (item) => item.category
            );
            setUserInterests([...new Set(interests)]); // Remove duplicates

            // Initialize filters with user interests if available
            if (interests.length > 0 && activeFilters.length === 0) {
              setActiveFilters(interests.slice(0, 3)); // Take first 3 interests as initial filters
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [isSignedIn, user]);

  // Fetch posts based on feed type
  useEffect(() => {
    fetchPosts();
  }, [feedType, activeFilters]);

  // Create real-time listener for new posts
  useEffect(() => {
    let unsubscribe;

    if (feedType === "forYou" || feedType === "following") {
      const baseQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      unsubscribe = onSnapshot(baseQuery, (snapshot) => {
        if (!snapshot.empty && posts.length > 0) {
          const newestDoc = snapshot.docs[0];
          const newestPost = newestDoc.data();
          const newestId = newestDoc.id;

          // Check if this post is newer than our current newest post
          if (newestId !== posts[0].id) {
            toast(
              <div className="flex items-center gap-2">
                <span>New posts available!</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    fetchPosts(true);
                  }}
                >
                  Refresh
                </Button>
              </div>,
              {
                duration: 10000,
              }
            );
          }
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [posts, feedType]);

  const fetchPosts = async (refresh = false) => {
    if (refresh) {
      setLastVisible(null);
      setPosts([]);
    }

    if (refresh || (!loadingMore && (hasMore || lastVisible === null))) {
      refresh ? setLoading(true) : setLoadingMore(true);

      try {
        let postsQuery;

        // Base query
        if (lastVisible) {
          postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(POSTS_PER_PAGE)
          );
        } else {
          postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            limit(POSTS_PER_PAGE)
          );
        }

        // Add filters based on feed type
        if (feedType === "following" && userFollowing.length > 0) {
          postsQuery = query(
            collection(db, "posts"),
            where("assciateUser", "in", userFollowing),
            orderBy("createdAt", "desc"),
            lastVisible ? startAfter(lastVisible) : limit(POSTS_PER_PAGE)
          );
        } else if (feedType === "trending") {
          postsQuery = query(
            collection(db, "posts"),
            orderBy("likes", "desc"),
            orderBy("createdAt", "desc"),
            lastVisible ? startAfter(lastVisible) : limit(POSTS_PER_PAGE)
          );
        }

        // Apply category filters if selected
        if (activeFilters.length > 0 && feedType === "forYou") {
          // Since Firestore doesn't support OR queries across fields directly,
          // we'll need to fetch posts and filter them client-side
          // This is a simplification - in a real app, you might use a different approach
          postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            lastVisible ? startAfter(lastVisible) : limit(POSTS_PER_PAGE * 3) // Fetch more to account for filtering
          );
        }

        const postsSnapshot = await getDocs(postsQuery);

        if (postsSnapshot.empty) {
          setHasMore(false);
          refresh ? setLoading(false) : setLoadingMore(false);
          return;
        }

        // Set the last visible document for pagination
        const lastDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
        setLastVisible(lastDoc);

        // Fetch posts with user information
        let postsData = await Promise.all(
          postsSnapshot.docs.map(async (docSnapshot) => {
            const postData = docSnapshot.data();

            // Apply client-side filtering for categories if needed
            if (activeFilters.length > 0 && postData.categories) {
              const hasMatchingCategory = postData.categories.some((category) =>
                activeFilters.includes(category)
              );

              if (!hasMatchingCategory) {
                return null; // Skip this post
              }
            }

            // Search term filtering
            if (searchTerm && postData.description) {
              if (
                !postData.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              ) {
                return null; // Skip if doesn't match search
              }
            }

            try {
              // Fetch user information
              let userData = null;
              if (postData.assciateUser) {
                const userDoc = await getDoc(
                  doc(db, "users", postData.assciateUser)
                );
                userData = userDoc.exists() ? userDoc.data() : null;
              }

              return {
                ...postData,
                id: docSnapshot.id,
                user: userData
                  ? {
                      imageUrl: userData.ppic || "https://i.pravatar.cc/150",
                      username: userData.username || "User",
                      firstName: userData.firstName || "",
                    }
                  : {
                      imageUrl: "https://i.pravatar.cc/150",
                      username: "Anonymous",
                      firstName: "",
                    },
              };
            } catch (userError) {
              console.error(
                `Error fetching user for post ${docSnapshot.id}:`,
                userError
              );
              return {
                ...postData,
                id: docSnapshot.id,
                user: {
                  imageUrl: "https://i.pravatar.cc/150",
                  username: "Anonymous",
                  firstName: "",
                },
              };
            }
          })
        );

        // Filter out null values (posts that didn't match filters)
        postsData = postsData.filter((post) => post !== null);

        // Set state based on whether this is a refresh or pagination
        if (refresh) {
          setPosts(postsData);
        } else {
          setPosts((prev) => [...prev, ...postsData]);
        }

        // Check if there are more posts to load
        setHasMore(postsData.length >= POSTS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Error loading posts");
      } finally {
        refresh ? setLoading(false) : setLoadingMore(false);
      }
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    toast.success("Post deleted");
  };

  const toggleFilter = (filter) => {
    setActiveFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(true);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-5 w-full max-w-2xl">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="w-full h-[400px]" />
          <div className="p-4 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
      {/* Feed type tabs */}
      <div className="w-full px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Tabs
            value={feedType}
            onValueChange={setFeedType}
            className="w-full max-w-md"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="forYou" className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-1.5">
                  <span>For You</span>
                </div>
                <div className="sm:hidden">
                  <span>For You</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="flex items-center gap-1.5"
              >
                <div className="hidden sm:flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Following</span>
                </div>
                <div className="sm:hidden">
                  <Users className="w-4 h-4" />
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="flex items-center gap-1.5"
              >
                <div className="hidden sm:flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </div>
                <div className="sm:hidden">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary/10" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchPosts(true)}
              disabled={loading}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Filter Posts</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilters([])}
                    disabled={activeFilters.length === 0}
                  >
                    Clear All
                  </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 py-2 px-3 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button
                      type="submit"
                      variant="default"
                      className="rounded-l-none"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                {/* Category filters */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {userInterests.length > 0 ? (
                      userInterests.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => toggleFilter(interest)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            activeFilters.includes(interest)
                              ? "bg-primary text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {interest}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No interests set. Update your profile to see relevant
                        categories.
                      </p>
                    )}
                  </div>
                </div>

                {/* Active filters */}
                {activeFilters.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Active Filters</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((filter) => (
                        <span
                          key={filter}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                        >
                          {filter}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFilter(filter)}
                            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Posts */}
      <div className="flex flex-col items-center p-2 sm:p-5 gap-6 w-full">
        {loading ? (
          <LoadingSkeleton />
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                image={post.images?.[0]}
                description={post.description}
                hasCarousel={post.hasCarousel}
                images={post.images || []}
                user={post.user}
                likes={post.likes}
                createdAt={post.createdAt}
                assciateUser={post.assciateUser}
                onDelete={handleDeletePost}
              />
            ))}

            {hasMore && (
              <Button
                onClick={() => fetchPosts()}
                disabled={loadingMore}
                variant="outline"
                className="w-full max-w-md my-4"
              >
                {loadingMore ? "Loading more posts..." : "Load More"}
              </Button>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400 py-4">
                No more posts to load. Check back later for new content!
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {feedType === "following"
                ? "Follow some crafters to see their posts here!"
                : feedType === "trending"
                ? "No trending posts available right now. Check back later!"
                : "No posts match your filters. Try changing your filters or search term."}
            </p>
            <Button
              onClick={() => {
                setActiveFilters([]);
                setSearchTerm("");
                fetchPosts(true);
              }}
              variant="outline"
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
