// components/PostCard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { formatRelativeTime } from "@/src/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import postService, { Comment } from "@/utils/postService";

interface PostCardProps {
  post: {
    id: string;
    images: string[];
    description?: string;
    assciateUser: string;
    likes: number;
    comments: any[];
    hasCarousel: boolean;
    saved: boolean;
    username?: string;
    userImage?: string;
    createdAt?: any;
    likedBy?: string[];
    tags?: string[];
  };
  onPostUpdate?: (updatedPost: any) => void;
  showComments?: boolean;
  showActions?: boolean;
  allowDelete?: boolean;
  onDelete?: (postId: string) => void;
}

export default function PostCard({
  post,
  onPostUpdate,
  showComments = false,
  showActions = true,
  allowDelete = false,
  onDelete,
}: PostCardProps) {
  const { user } = useUser();
  // const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [visibleComments, setVisibleComments] = useState<any[]>([]);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Check if post is liked by current user
  useEffect(() => {
    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.id));
    }
  }, [user, post.likedBy]);

  // Check if post is saved by current user
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const savedPosts = userData.savedPosts || [];
          setIsSaved(savedPosts.includes(post.id));
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkSavedStatus();
  }, [user, post.id]);

  // Process comments for display
  useEffect(() => {
    if (post.comments && post.comments.length > 0) {
      // Sort comments by createdAt date, newest first
      const sortedComments = [...post.comments].sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt.seconds * 1000)
          : new Date();
        const dateB = b.createdAt
          ? new Date(b.createdAt.seconds * 1000)
          : new Date();
        return dateB.getTime() - dateA.getTime();
      });

      // Show all comments if expanded, otherwise only the first 3
      setVisibleComments(
        commentsExpanded ? sortedComments : sortedComments.slice(0, 3)
      );
    } else {
      setVisibleComments([]);
    }
  }, [post.comments, commentsExpanded]);

  // Handle image carousel navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === post.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? post.images.length - 1 : prev - 1
      );
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!user) {
      toast.error("Sign in required. Please sign in to like posts.");
      // toast({
      //   title: "Sign in required",
      //   description: "Please sign in to like posts",
      //   variant: "destructive",
      // });
      return;
    }

    try {
      // Optimistic update
      setIsLiked(!isLiked);
      const newLikes = isLiked ? post.likes - 1 : post.likes + 1;

      // Update local post state if callback provided
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          likes: newLikes,
          likedBy: isLiked
            ? (post.likedBy || []).filter((id: string) => id !== user.id)
            : [...(post.likedBy || []), user.id],
        });
      }

      // Update in database
      if (isLiked) {
        await postService.unlikePost(post.id, user.id);
      } else {
        await postService.likePost(post.id, user.id);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      toast.error("Failed to update likes. Please try again.");
      // toast({
      //   title: "Error",
      //   description: "Failed to update like. Please try again.",
      //   variant: "destructive",
      // });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!user) {
      toast.error("Sign in required. Please sign in to save posts.");
      // toast({
      //   title: "Sign in required",
      //   description: "Please sign in to save posts",
      //   variant: "destructive",
      // });
      return;
    }

    try {
      // Optimistic update
      setIsSaved(!isSaved);

      // Update in database
      if (isSaved) {
        await postService.unsavePost(post.id, user.id);
      } else {
        await postService.savePost(post.id, user.id);
      }

      toast.success(
        `${
          isSaved ? "Post removed from saved items" : "Post saved successfully"
        }`
      );
    } catch (error) {
      console.error("Error updating save status:", error);
      // Revert optimistic update on error
      setIsSaved(!isSaved);
      toast.error("Failed to update saved status. Please try again.");
      // toast({
      //   title: "Error",
      //   description: "Failed to update saved status. Please try again.",
      //   variant: "destructive",
      // });
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this Craftly post",
          text:
            post.description || "I found this amazing craft post on Craftly!",
          url: `${window.location.origin}/post/${post.id}`,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
        });
    } else {
      // Fallback for browsers that don't support navigator.share
      const shareUrl = `${window.location.origin}/post/${post.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.info(
        "Link copied to clipboard. Share this link with your friends!"
      );
      // toast({
      //   title: "Link copied to clipboard",
      //   description: "Share this link with your friends!",
      // });
    }
  };

  // Handle comment submission
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    try {
      setIsSubmittingComment(true);

      const newComment: Comment = {
        userId: user.id,
        username: user.username || user.firstName || "User",
        profileImage: user.imageUrl,
        text: comment.trim(),
      };

      // Add to database
      const commentId = await postService.addComment(post.id, newComment);

      // Update client-side comments with optimistic rendering
      const commentWithId = {
        ...newComment,
        id: commentId,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      // Update post locally if callback provided
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          comments: [commentWithId, ...(post.comments || [])],
        });
      }

      // Show comment instantly
      setVisibleComments([commentWithId, ...visibleComments]);
      setComment("");

      toast.success("Comment added", { duration: 2000 });

      // toast({
      //   title: "Comment added",
      //   duration: 2000,
      // });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to post comment. Please try again.");
      // toast({
      //   title: "Error",
      //   description: "Failed to post comment. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!user || !allowDelete) return;

    // Confirmation dialog
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await postService.deletePost(post.id);
      toast.success("Post deleted successfully");

      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Please try again");
    }
  };

  // Format post date
  const getPostDate = () => {
    if (!post.createdAt) return "Recently";

    const postDate = post.createdAt.seconds
      ? new Date(post.createdAt.seconds * 1000)
      : new Date(post.createdAt);

    return formatRelativeTime(postDate);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
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
            <p className="font-medium">{post.username || "Crafter"}</p>
            <p className="text-gray-500 text-xs">{getPostDate()}</p>
          </div>
        </Link>

        {/* Post Actions Menu */}
        {(allowDelete || post.assciateUser === user?.id) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allowDelete && (
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  className="text-red-500"
                >
                  <Trash size={16} className="mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post Image Carousel */}
      <div className="relative">
        <img
          src={post.images[currentImageIndex] || "/post-placeholder.jpg"}
          alt={post.description || "Post"}
          className="w-full aspect-square object-cover"
        />

        {/* Carousel navigation if multiple images */}
        {post.hasCarousel && post.images.length > 1 && (
          <div className="absolute inset-0 flex justify-between items-center px-4">
            <button
              onClick={prevImage}
              className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Image dots indicator */}
        {post.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              {post.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="p-4">
        {showActions && (
          <div className="flex space-x-4 mb-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition ${
                isLiked ? "text-red-500" : "text-gray-700 hover:text-red-500"
              }`}
            >
              <Heart className={isLiked ? "fill-current" : ""} size={20} />
              <span>{post.likes}</span>
            </button>
            <button
              className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition"
              onClick={() => setCommentsExpanded(!commentsExpanded)}
            >
              <MessageCircle size={20} />
              <span>{post.comments?.length || 0}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-gray-700 hover:text-green-500 transition ml-auto"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1 transition ${
                isSaved
                  ? "text-yellow-500"
                  : "text-gray-700 hover:text-yellow-500"
              }`}
            >
              <Bookmark className={isSaved ? "fill-current" : ""} size={20} />
            </button>
          </div>
        )}

        {/* Post Caption */}
        <p className="text-gray-800">
          <span className="font-medium">{post.username || "Crafter"} </span>
          {post.description ||
            "Check out my latest craft project! #craftly #create"}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, idx) => (
              <Link
                key={idx}
                href={`/discover/tags/${tag}`}
                className="text-sm text-blue-500 hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Comments Section */}
        {(showComments || commentsExpanded) && visibleComments.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Comments</p>
            {visibleComments.map((comment, index) => (
              <div key={comment.id || index} className="flex items-start gap-2">
                <img
                  src={comment.profileImage || "/profile-placeholder.jpg"}
                  alt={comment.username || "User"}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {comment.username || "User"}{" "}
                    </span>
                    {comment.text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {comment.createdAt
                      ? formatRelativeTime(new Date(comment.createdAt))
                      : "Just now"}
                  </p>
                </div>
              </div>
            ))}

            {post.comments && post.comments.length > 3 && !commentsExpanded && (
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setCommentsExpanded(true)}
              >
                View all {post.comments.length} comments
              </button>
            )}

            {commentsExpanded && post.comments && post.comments.length > 3 && (
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setCommentsExpanded(false)}
              >
                Show less
              </button>
            )}
          </div>
        )}

        {/* View Comments Link */}
        {!showComments &&
          !commentsExpanded &&
          post.comments &&
          post.comments.length > 0 && (
            <div
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => setCommentsExpanded(true)}
            >
              <p>View all {post.comments.length} comments</p>
            </div>
          )}

        {/* Add Comment */}
        {user && (
          <form onSubmit={handleComment} className="mt-3 flex">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmittingComment}
              className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-custom-mint disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!comment.trim() || isSubmittingComment}
              className={`ml-2 font-medium text-sm ${
                comment.trim() && !isSubmittingComment
                  ? "text-custom-mint"
                  : "text-gray-400"
              }`}
            >
              {isSubmittingComment ? "Posting..." : "Post"}
            </button>
          </form>
        )}

        {!user && (
          <div className="mt-3 text-sm text-gray-500">
            <Link href="/signin" className="text-custom-mint hover:underline">
              Sign in
            </Link>{" "}
            to add a comment
          </div>
        )}
      </div>
    </div>
  );
}
