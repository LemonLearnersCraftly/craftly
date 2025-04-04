// src/app/(protected)/patterns/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  Heart,
  Download,
  Bookmark,
  Share2,
  User,
  Calendar,
  BarChart,
  Printer,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

// This would come from Firestore in a real app
const samplePattern = {
  id: "pattern1",
  title: "Cozy Winter Scarf",
  description:
    "A beautiful scarf pattern perfect for beginners. This pattern uses simple stitches to create a textured look that's both warm and stylish.",
  images: [
    "/patterns/scarf.jpg",
    "/patterns/scarf2.jpg",
    "/patterns/scarf3.jpg",
  ],
  type: "knitting",
  difficulty: "beginner",
  author: "Sarah Knits",
  authorId: "user123",
  authorImage: "/profile-placeholder.jpg",
  materials: [
    "200g worsted weight yarn (shown in cream)",
    "5.5mm (US 9) knitting needles",
    "Tapestry needle for weaving in ends",
    "Scissors",
  ],
  tools: [
    "5.5mm (US 9) knitting needles",
    "Tapestry needle",
    "Scissors",
    "Measuring tape",
  ],
  instructions: [
    {
      title: "Preparation",
      steps: [
        "Check your gauge: 18 stitches and 24 rows = 4 inches in stockinette stitch",
        'The finished scarf will measure approximately 7" wide and 65" long',
      ],
    },
    {
      title: "Pattern",
      steps: [
        "Cast on 32 stitches using your preferred method.",
        "Row 1 (right side): *K2, P2; repeat from * to end of row.",
        "Row 2 (wrong side): *K2, P2; repeat from * to end of row.",
        'Repeat rows 1 and 2 until scarf measures approximately 65" from cast on edge.',
        "Bind off in pattern. Weave in ends.",
      ],
    },
    {
      title: "Finishing",
      steps: [
        "Block your scarf by gently washing it according to your yarn's care instructions.",
        "Lay flat to dry, stretching slightly to shape.",
      ],
    },
  ],
  notes:
    "This scarf uses a simple 2x2 rib stitch that creates a stretchy, reversible fabric perfect for keeping warm. Feel free to adjust the length for your personal preference.",
  tags: ["beginner", "scarf", "winter", "knitting", "ribbing"],
  likes: 124,
  downloads: 68,
  saved: false,
  comments: [
    {
      id: "comment1",
      userId: "user456",
      username: "KnitLover",
      profileImage: "/profile-placeholder.jpg",
      text: "I made this with a chunky yarn and it turned out amazing! Thanks for the pattern.",
      createdAt: new Date().toISOString(),
      likes: 5,
    },
    {
      id: "comment2",
      userId: "user789",
      username: "CraftyCreator",
      profileImage: "/profile-placeholder.jpg",
      text: "Perfect for beginners. I'm going to try this with some variegated yarn I have.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 3,
    },
  ],
  createdAt: { seconds: 1649067600 },
};

// Difficulty badges with colors
const difficultyBadges: Record<
  string,
  { text: string; color: string; bgColor: string }
> = {
  beginner: {
    text: "Beginner",
    color: "text-green-800",
    bgColor: "bg-green-100",
  },
  intermediate: {
    text: "Intermediate",
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  advanced: { text: "Advanced", color: "text-red-800", bgColor: "bg-red-100" },
};

// Craft type badges with colors
const craftTypeBadges: Record<
  string,
  { text: string; color: string; bgColor: string }
> = {
  knitting: {
    text: "Knitting",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
  },
  crochet: {
    text: "Crochet",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
  },
  sewing: { text: "Sewing", color: "text-pink-800", bgColor: "bg-pink-100" },
  embroidery: {
    text: "Embroidery",
    color: "text-indigo-800",
    bgColor: "bg-indigo-100",
  },
  quilting: {
    text: "Quilting",
    color: "text-orange-800",
    bgColor: "bg-orange-100",
  },
  macrame: { text: "Macrame", color: "text-teal-800", bgColor: "bg-teal-100" },
};

export default function PatternDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [pattern, setPattern] = useState(samplePattern);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(pattern.saved);
  const [comment, setComment] = useState("");

  useEffect(() => {
    // In a real app, we would fetch the pattern by ID from Firestore
    // For now, we'll just use the sample data and simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setPattern((prev) => ({
      ...prev,
      likes: isLiked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, we would update Firestore
  };

  const handleDownload = () => {
    setPattern((prev) => ({
      ...prev,
      downloads: prev.downloads + 1,
    }));
    // In a real app, this would generate a PDF
    alert("Your pattern is being downloaded!");
  };

  const handleImageNav = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment = {
      id: `comment${pattern.comments.length + 1}`,
      userId: user?.id || "unknown",
      username: user?.username || "Anonymous",
      profileImage: user?.imageUrl || "/profile-placeholder.jpg",
      text: comment,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setPattern((prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments],
    }));

    setComment("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-mint"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-custom-sage transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Patterns</span>
          </button>
        </div>

        {/* Pattern header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pattern images */}
            <div className="md:order-2">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={
                    pattern.images[currentImageIndex] ||
                    "/pattern-placeholder.jpg"
                  }
                  alt={pattern.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnail navigation */}
              {pattern.images.length > 1 && (
                <div className="flex mt-4 gap-2 justify-center">
                  {pattern.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageNav(idx)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        idx === currentImageIndex
                          ? "border-custom-mint"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${pattern.title} - view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pattern details */}
            <div className="p-6 md:order-1">
              <div className="flex items-start gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    difficultyBadges[pattern.difficulty]?.bgColor
                  } ${difficultyBadges[pattern.difficulty]?.color}`}
                >
                  {difficultyBadges[pattern.difficulty]?.text ||
                    pattern.difficulty}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    craftTypeBadges[pattern.type]?.bgColor
                  } ${craftTypeBadges[pattern.type]?.color}`}
                >
                  {craftTypeBadges[pattern.type]?.text || pattern.type}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-3">{pattern.title}</h1>
              <p className="text-gray-700 mb-6">{pattern.description}</p>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Link
                    href={`/profile/${pattern.authorId}`}
                    className="flex items-center hover:underline"
                  >
                    <img
                      src={pattern.authorImage}
                      alt={pattern.author}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="font-medium">{pattern.author}</p>
                      <p className="text-gray-500 text-xs">Craftly Creator</p>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(
                        pattern.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-gray-400" />
                    <span className="text-gray-600">{pattern.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {pattern.downloads} downloads
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart size={16} className="text-gray-400" />
                    <span className="text-gray-600">{pattern.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {pattern.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <ShimmerButton onClick={handleDownload} className="flex-1">
                  <Download size={16} className="mr-2" />
                  <span className="font-medium">Download Pattern</span>
                </ShimmerButton>

                <Button
                  variant="outline"
                  onClick={handleLike}
                  className={`${
                    isLiked ? "text-red-500 border-red-500" : "text-gray-700"
                  }`}
                >
                  <Heart size={16} className={isLiked ? "fill-current" : ""} />
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSave}
                  className={`${
                    isSaved
                      ? "text-yellow-500 border-yellow-500"
                      : "text-gray-700"
                  }`}
                >
                  <Bookmark
                    size={16}
                    className={isSaved ? "fill-current" : ""}
                  />
                </Button>

                <Button variant="outline">
                  <Share2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Tabs defaultValue="instructions">
            <TabsList className="w-full border-b justify-start p-0 bg-transparent">
              <TabsTrigger
                value="instructions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-custom-mint data-[state=active]:bg-transparent"
              >
                Instructions
              </TabsTrigger>
              <TabsTrigger
                value="materials"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-custom-mint data-[state=active]:bg-transparent"
              >
                Materials & Tools
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-custom-mint data-[state=active]:bg-transparent"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-custom-mint data-[state=active]:bg-transparent"
              >
                Comments ({pattern.comments.length})
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="instructions">
                <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Instructions</h2>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Printer size={16} />
                      <span>Print</span>
                    </Button>
                  </div>

                  {pattern.instructions.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="mb-8">
                      <h3 className="text-xl font-bold mb-3">
                        {section.title}
                      </h3>
                      <ol className="space-y-4">
                        {section.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-custom-mint text-white flex items-center justify-center text-sm">
                              {stepIdx + 1}
                            </div>
                            <p className="text-gray-700">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="materials">
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Materials</h2>
                      <ul className="space-y-3">
                        {pattern.materials.map((material, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-custom-mint mt-2"></div>
                            <span className="text-gray-700">{material}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Tools</h2>
                      <ul className="space-y-3">
                        {pattern.tools.map((tool, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-custom-mint mt-2"></div>
                            <span className="text-gray-700">{tool}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Designer's Notes</h2>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-line">
                      {pattern.notes}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comments">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Comments</h2>

                  {/* Comment form */}
                  <form onSubmit={handleAddComment} className="mb-8">
                    <div className="flex gap-3">
                      <img
                        src={user?.imageUrl || "/profile-placeholder.jpg"}
                        alt="Your profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts or ask a question..."
                          className="w-full p-3 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-custom-mint"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <Button
                            type="submit"
                            disabled={!comment.trim()}
                            className="bg-custom-mint hover:bg-custom-sage text-white"
                          >
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Comments list */}
                  <div className="space-y-6">
                    {pattern.comments.length > 0 ? (
                      pattern.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <img
                            src={comment.profileImage}
                            alt={comment.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">
                                  {comment.username}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.text}</p>
                            </div>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-custom-sage transition-colors">
                                <Heart size={14} />
                                <span>{comment.likes}</span>
                              </button>
                              <span className="mx-2">·</span>
                              <button className="hover:text-custom-sage transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <MessageCircle className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
