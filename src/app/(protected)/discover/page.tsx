// src/app/(protected)/discover/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { db } from "@/utils/firebaseConfig";
import {
  collection,
  query,
  getDocs,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { UserConverter } from "@/models/Users";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Search,
  Filter,
  Tag as TagIcon,
  MessageSquare,
  Image as ImageIcon,
  Flame,
  Users as UsersIcon,
} from "lucide-react";

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

// Helper function to get random interests
const getRandomInterests = () => {
  const allInterests = Object.keys(interestColorMap);
  const numInterests = Math.floor(Math.random() * 3) + 1;
  const interests: string[] = [];

  for (let i = 0; i < numInterests; i++) {
    const randomIndex = Math.floor(Math.random() * allInterests.length);
    const interest = allInterests[randomIndex];

    if (!interests.includes(interest)) {
      interests.push(interest);
    }
  }

  return interests;
};

// Sample user data (would come from Firestore)
const sampleUsers = [
  {
    id: "user1",
    username: "KnitMaster",
    email: "knitmaster@example.com",
    imageUrl: "/user1.jpg",
    interests: {
      total: 3,
      items: ["Knitting", "Crochet", "Sewing"],
    },
    following: { total: 42, items: [] },
    followers: 128,
    posts: { total: 24, items: [] },
  },
  {
    id: "user2",
    username: "CraftyCat",
    email: "craftycat@example.com",
    imageUrl: "/user2.jpg",
    interests: {
      total: 2,
      items: ["Embroidery", "Quilting"],
    },
    following: { total: 67, items: [] },
    followers: 215,
    posts: { total: 36, items: [] },
  },
  {
    id: "user3",
    username: "YarnQueen",
    email: "yarnqueen@example.com",
    imageUrl: "/user3.jpg",
    interests: {
      total: 4,
      items: ["Knitting", "Crochet", "Macrame", "Felting"],
    },
    following: { total: 92, items: [] },
    followers: 310,
    posts: { total: 48, items: [] },
  },
  {
    id: "user4",
    username: "StitchWizard",
    email: "stitchwizard@example.com",
    imageUrl: "/user4.jpg",
    interests: {
      total: 2,
      items: ["Sewing", "Cross Stitch"],
    },
    following: { total: 28, items: [] },
    followers: 95,
    posts: { total: 18, items: [] },
  },
  {
    id: "user5",
    username: "PaperPro",
    email: "paperpro@example.com",
    imageUrl: "/user5.jpg",
    interests: {
      total: 3,
      items: ["Paper Crafts", "Candle Making", "Jewelery Making"],
    },
    following: { total: 35, items: [] },
    followers: 112,
    posts: { total: 29, items: [] },
  },
];

// Sample trending hashtags
const trendingTags = [
  { tag: "knittersofcraftly", count: 1243 },
  { tag: "crochetersunite", count: 986 },
  { tag: "handmadewithlove", count: 754 },
  { tag: "sewingproject", count: 612 },
  { tag: "embroideryart", count: 498 },
  { tag: "papercraft", count: 423 },
  { tag: "yarnlove", count: 387 },
  { tag: "quiltersofinstagram", count: 341 },
  { tag: "macramemakers", count: 289 },
  { tag: "feltingfun", count: 243 },
];

// Sample trending posts (simplified)
const trendingPosts = Array(6)
  .fill(null)
  .map((_, i) => ({
    id: `post${i + 1}`,
    image: `/post${i + 1}.jpg`,
    likes: Math.floor(Math.random() * 500) + 100,
    comments: Math.floor(Math.random() * 50) + 10,
    username: [
      "KnitMaster",
      "CraftyCat",
      "YarnQueen",
      "StitchWizard",
      "PaperPro",
    ][Math.floor(Math.random() * 5)],
  }));

export default function DiscoverPage() {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState(sampleUsers);
  const [filteredUsers, setFilteredUsers] = useState(sampleUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("All");
  const [loading, setLoading] = useState(true);

  // In a real app, we would fetch users from Firestore
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter users based on search and interests
  useEffect(() => {
    let results = users;

    if (searchTerm) {
      results = results.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedInterest !== "All") {
      results = results.filter((user) =>
        user.interests.items.includes(selectedInterest)
      );
    }

    setFilteredUsers(results);
  }, [searchTerm, selectedInterest, users]);

  // Get all interests for filtering
  const allInterests = ["All"].concat(
    Array.from(new Set(users.flatMap((user) => user.interests.items)))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-mint"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-6 text-custom-sage">Discover</h1>

          <Tabs defaultValue="people">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="people" className="flex items-center gap-2">
                <UsersIcon size={16} />
                <span>Crafters</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <Flame size={16} />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-2">
                <TagIcon size={16} />
                <span>Tags</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="people">
              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-3">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search crafters by name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-mint"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <select
                      value={selectedInterest}
                      onChange={(e) => setSelectedInterest(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-mint"
                    >
                      {allInterests.map((interest) => (
                        <option key={interest} value={interest}>
                          {interest === "All" ? "All Interests" : interest}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* User Cards */}
              {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No crafters found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or filter
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedInterest("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold">Trending Now</h2>
                  <p className="text-gray-600 text-sm">
                    See what's popular in the craft community
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {trendingPosts.map((post, idx) => (
                    <div
                      key={idx}
                      className="relative group cursor-pointer aspect-square"
                    >
                      <img
                        src={`https://picsum.photos/seed/${post.id}/400`}
                        alt="Trending post"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-white text-sm font-medium">
                          @{post.username}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-white text-xs flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-3 h-3"
                            >
                              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                            {post.likes}
                          </span>
                          <span className="text-white text-xs flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-3 h-3"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 text-center">
                  <Button variant="outline">View More</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tags">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">Popular Tags</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingTags.map((tag, idx) => (
                    <Link
                      key={idx}
                      href={`/discover/tags/${tag.tag}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:border-custom-mint hover:bg-custom-mint/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TagIcon size={16} className="text-custom-mint" />
                        <span className="font-medium">#{tag.tag}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {tag.count} posts
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            {/* Suggested Users */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h2 className="font-bold mb-4">Suggested for You</h2>

              <div className="space-y-4">
                {sampleUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={`https://picsum.photos/seed/${user.id}/200`}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-gray-500 text-xs">
                          {user.posts.total} posts
                        </p>
                      </div>
                    </Link>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>

              <Link
                href="/discover"
                className="block text-center text-custom-mint hover:text-custom-sage font-medium text-sm mt-4"
              >
                See More
              </Link>
            </div>

            {/* Popular Categories */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-bold mb-4">Popular Categories</h2>

              <div className="flex flex-wrap gap-2">
                {Object.keys(interestColorMap)
                  .slice(0, 10)
                  .map((interest) => (
                    <button
                      key={interest}
                      onClick={() => setSelectedInterest(interest)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedInterest === interest
                          ? `${interestColorMap[interest]} text-white`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      {interest}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserCardProps {
  user: any;
}

function UserCard({ user }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    // In a real app, this would update the database
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-custom-mint to-custom-sage relative">
        {/* Placeholder for cover image */}
      </div>

      <div className="p-4 pt-0">
        <div className="flex justify-between">
          <div className="flex-shrink-0 -mt-12">
            <img
              src={`https://picsum.photos/seed/${user.id}/200`}
              alt={user.username}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
          </div>

          <Button
            variant={isFollowing ? "outline" : "default"}
            className={
              isFollowing
                ? "border-custom-mint text-custom-mint mt-2"
                : "bg-custom-mint hover:bg-custom-sage mt-2"
            }
            onClick={handleFollow}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>

        <Link href={`/profile/${user.id}`}>
          <h3 className="text-xl font-bold mt-2 hover:text-custom-sage transition-colors">
            {user.username}
          </h3>
        </Link>

        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ImageIcon size={14} />
            <span>{user.posts.total} posts</span>
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon size={14} />
            <span>{user.followers} followers</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {user.interests.items.map((interest: string) => (
            <span
              key={interest}
              className={`${interestColorMap[interest]} text-white text-xs px-2 py-1 rounded-full`}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
