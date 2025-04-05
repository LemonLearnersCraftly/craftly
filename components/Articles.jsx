"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Bookmark,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/firestore";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Mock articles - in a real application, these would come from a CMS or database
const MOCK_ARTICLES = [
  {
    id: "a1",
    image: "https://images.unsplash.com/photo-1632649027900-389e810204e6?w=800",
    title: "Beginner's Guide to Crocheting: Essential Stitches",
    author: "Sarah Johnson",
    link: "https://www.example.com/crochet-guide",
    readTime: "5 min read",
    createdAt: new Date("2023-12-15"),
    categories: ["crochet", "beginner", "tutorial"],
  },
  {
    id: "a2",
    image: "https://images.unsplash.com/photo-1549497538-303791108f95?w=800",
    title: "10 Advanced Knitting Patterns for Winter Wear",
    author: "Emma Thompson",
    link: "https://www.example.com/knitting-patterns",
    readTime: "8 min read",
    createdAt: new Date("2024-01-20"),
    categories: ["knitting", "advanced", "patterns", "winter"],
  },
  {
    id: "a3",
    image: "https://images.unsplash.com/photo-1609244078312-1c507158ae3c?w=800",
    title: "Creating Beautiful Quilts: Step-by-Step Guide",
    author: "Patricia Wilson",
    link: "https://www.example.com/quilting-guide",
    readTime: "12 min read",
    createdAt: new Date("2024-02-05"),
    categories: ["quilting", "sewing", "tutorial"],
  },
  {
    id: "a4",
    image: "https://images.unsplash.com/photo-1598623449524-05233276ab3f?w=800",
    title: "The Art of Pottery: Getting Started with Clay",
    author: "Michael Robinson",
    link: "https://www.example.com/pottery-guide",
    readTime: "10 min read",
    createdAt: new Date("2024-01-10"),
    categories: ["pottery", "ceramics", "beginner"],
  },
  {
    id: "a5",
    image: "https://images.unsplash.com/photo-1610177498701-4f00c0bd1694?w=800",
    title: "Sustainable Crafting: Eco-Friendly Materials Guide",
    author: "Jessica Green",
    link: "https://www.example.com/eco-crafting",
    readTime: "7 min read",
    createdAt: new Date("2024-02-18"),
    categories: ["sustainability", "eco-friendly", "materials"],
  },
  {
    id: "a6",
    image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800",
    title: "Watercolor Painting Techniques for Landscapes",
    author: "David Lee",
    link: "https://www.example.com/watercolor-landscapes",
    readTime: "9 min read",
    createdAt: new Date("2024-01-05"),
    categories: ["painting", "watercolor", "techniques"],
  },
  {
    id: "a7",
    image: "https://images.unsplash.com/photo-1614083388839-713cf33e236b?w=800",
    title: "DIY Home Decor: Upcycling Furniture Projects",
    author: "Rachel Adams",
    link: "https://www.example.com/diy-furniture",
    readTime: "6 min read",
    createdAt: new Date("2024-02-25"),
    categories: ["diy", "home decor", "upcycling", "furniture"],
  },
  {
    id: "a8",
    image: "https://images.unsplash.com/photo-1596822596739-fb91da3918be?w=800",
    title: "Embroidery 101: Essential Stitches and Tools",
    author: "Laura Chen",
    link: "https://www.example.com/embroidery-basics",
    readTime: "8 min read",
    createdAt: new Date("2024-01-15"),
    categories: ["embroidery", "sewing", "beginner", "tools"],
  },
  {
    id: "a9",
    image: "https://images.unsplash.com/photo-1590075865003-bfc94c2c8dc9?w=800",
    title: "Making Your Own Handmade Jewelry: Metal Basics",
    author: "Sophie Miller",
    link: "https://www.example.com/jewelry-making",
    readTime: "11 min read",
    createdAt: new Date("2024-02-10"),
    categories: ["jewelry", "metalwork", "beginner"],
  },
  {
    id: "a10",
    image: "https://images.unsplash.com/photo-1552173386-452f3d9fe321?w=800",
    title: "Paper Crafts: Advanced Origami Techniques",
    author: "Thomas Wilson",
    link: "https://www.example.com/advanced-origami",
    readTime: "7 min read",
    createdAt: new Date("2023-12-20"),
    categories: ["paper crafts", "origami", "advanced"],
  },
];

export default function EnhancedArticles() {
  const { user, isSignedIn } = useUser();
  const [userInterests, setUserInterests] = useState([]);
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recommended");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        // Get user document to extract interests
        const userDoc = await getDoc(doc(db, "users", user.id));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Set user interests
          if (userData.interests && userData.interests.items) {
            const interestCategories = userData.interests.items
              .filter((item) => item.category)
              .map((item) => item.category.toLowerCase());

            setUserInterests([...new Set(interestCategories)]); // Remove duplicates
          }

          // Get saved articles
          const savedArticlesQuery = query(
            collection(db, "savedArticles"),
            where("userId", "==", user.id)
          );

          const savedArticlesSnapshot = await getDocs(savedArticlesQuery);
          const savedArticlesData = savedArticlesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setSavedArticles(savedArticlesData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isSignedIn, user]);

  // Filter and sort articles based on user interests
  useEffect(() => {
    const filterAndSortArticles = () => {
      // In a real application, you would fetch these from a database
      // For now, we'll use our mock data and filter based on the user's interests
      let filteredArticles = [...MOCK_ARTICLES];

      // If user has interests, prioritize those articles
      if (userInterests.length > 0) {
        // Calculate a relevance score for each article based on how many matching categories it has
        filteredArticles = filteredArticles.map((article) => {
          const matchingCategories = article.categories.filter((category) =>
            userInterests.some(
              (interest) =>
                category.toLowerCase().includes(interest.toLowerCase()) ||
                interest.toLowerCase().includes(category.toLowerCase())
            )
          );

          return {
            ...article,
            relevanceScore: matchingCategories.length,
          };
        });

        // Sort by relevance score (descending) and then by date (descending)
        filteredArticles.sort((a, b) => {
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      } else {
        // If no interests, just sort by date
        filteredArticles.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      setArticles(filteredArticles);
    };

    filterAndSortArticles();
  }, [userInterests]);

  const isArticleSaved = (articleId) => {
    return savedArticles.some((saved) => saved.articleId === articleId);
  };

  const toggleSaveArticle = async (article) => {
    if (!isSignedIn) {
      toast.error("Please sign in to save articles");
      return;
    }

    try {
      const isSaved = isArticleSaved(article.id);

      if (isSaved) {
        // Find and delete the saved article document
        const savedArticleDoc = savedArticles.find(
          (saved) => saved.articleId === article.id
        );

        if (savedArticleDoc) {
          await deleteDoc(doc(db, "savedArticles", savedArticleDoc.id));

          // Update local state
          setSavedArticles((prev) =>
            prev.filter((saved) => saved.articleId !== article.id)
          );
          toast.success("Article removed from saved");
        }
      } else {
        // Create a new saved article document
        const newSavedArticle = {
          userId: user.id,
          articleId: article.id,
          title: article.title,
          image: article.image,
          author: article.author,
          link: article.link,
          readTime: article.readTime,
          savedAt: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, "savedArticles"),
          newSavedArticle
        );

        // Update local state
        setSavedArticles((prev) => [
          ...prev,
          { id: docRef.id, ...newSavedArticle },
        ]);
        toast.success("Article saved!");
      }
    } catch (error) {
      console.error("Error toggling article save:", error);
      toast.error("Failed to update saved articles");
    }
  };

  const ArticleCard = ({ article, saved = false }) => (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={() => toggleSaveArticle(article)}
          >
            <Bookmark
              className={`h-4 w-4 ${
                saved ? "fill-primary text-primary" : "text-gray-700"
              }`}
            />
          </Button>
        </div>
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
          {article.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>By {article.author}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {article.categories.slice(0, 3).map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="px-2 py-0.5 text-xs"
            >
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="ghost" size="sm" asChild>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary"
          >
            Read Article
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="sticky top-0 w-full h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Articles</h2>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="pt-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 w-full h-full max-h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Articles</h2>
          </div>
          {!isSignedIn && (
            <Button variant="ghost" size="sm" asChild>
              <a href="/signin" className="text-primary text-sm">
                Sign in
              </a>
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="recommended"
              className="flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Recommended</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-4">
        <TabsContent value="recommended" className="m-0">
          {userInterests.length === 0 && isSignedIn && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
              <p>
                Update your interests in profile settings to see more
                personalized article recommendations!
              </p>
            </div>
          )}

          {articles.length > 0 ? (
            <div className="grid gap-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  saved={isArticleSaved(article.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No articles available right now.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="m-0">
          {!isSignedIn ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500 mb-4">
                Sign in to save your favorite articles
              </p>
              <Button asChild>
                <a href="/signin">Sign In</a>
              </Button>
            </div>
          ) : savedArticles.length > 0 ? (
            <div className="grid gap-4">
              {savedArticles.map((saved) => {
                const article = {
                  id: saved.articleId,
                  title: saved.title,
                  image: saved.image,
                  author: saved.author,
                  link: saved.link,
                  readTime: saved.readTime,
                  categories: saved.categories || [],
                };

                return (
                  <ArticleCard key={saved.id} article={article} saved={true} />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bookmark className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500">
                You haven't saved any articles yet
              </p>
            </div>
          )}
        </TabsContent>
      </div>
    </div>
  );
}
