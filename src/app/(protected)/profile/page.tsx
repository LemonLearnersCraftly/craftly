"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PostSchema, PostConverter } from "@/models/Posts";
import { DraftSchema, DraftConverter } from "@/models/Drafts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Image as ImageIcon, Bookmark } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  description: string;
  images: string[];
  hasCarousel: boolean;
  assciateUser: string;
  likes: number;
  comments: any[];
  saved: boolean;
}

interface Draft {
  id: string;
  description: string;
  images: string[];
  hasCarousel: boolean;
  associateUser: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfilePage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchUserContent = async () => {
      if (!user) return;

      try {
        // Fetch posts
        const postsQuery = query(
          collection(db, "posts"),
          where("assciateUser", "==", user.id)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map((doc) => ({
          ...PostConverter.fromFirestore(doc),
          id: doc.id,
        })) as Post[];
        setPosts(postsData);

        // Fetch drafts
        const draftsQuery = query(
          collection(db, "drafts"),
          where("associateUser", "==", user.id)
        );
        const draftsSnapshot = await getDocs(draftsQuery);
        const draftsData = draftsSnapshot.docs.map((doc) => ({
          ...DraftConverter.fromFirestore(doc),
          id: doc.id,
        })) as Draft[];
        setDrafts(draftsData);
      } catch (error) {
        console.error("Error fetching user content:", error);
      }
    };

    fetchUserContent();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-6">
          <img
            src={user.imageUrl}
            alt={`${user.username || user.firstName}'s profile`}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.username || user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {user.primaryEmailAddress?.emailAddress}
            </p>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">
                  {posts.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Posts
                </p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">
                  {drafts.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Drafts
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={post.images[0]}
                    alt={post.description}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {post.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <Card key={draft.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  {draft.images[0] ? (
                    <img
                      src={draft.images[0]}
                      alt={draft.description}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {draft.description}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm">
                      Edit Draft
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              No saved posts yet
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
