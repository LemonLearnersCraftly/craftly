"use client";

import { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  X,
  MoreHorizontal,
  Trash,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
  getDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/utils/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PostCard({
  id, // The post ID
  image,
  description,
  hasCarousel,
  images = [],
  user,
  likes = 0,
  createdAt,
  assciateUser, // User ID of the post creator
  onDelete, // Callback for when a post is deleted
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user: currentUser, isSignedIn } = useUser();
  const commentInputRef = useRef(null);
  const optionsRef = useRef(null);

  // If no images array is provided but image is, use it
  const imagesArray = images.length > 0 ? images : image ? [image] : [];

  // Handle click outside for options menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if the current user has liked the post
  useEffect(() => {
    const checkUserLike = async () => {
      if (!isSignedIn || !currentUser || !id) return;

      try {
        const likeDoc = await getDocs(
          query(
            collection(db, "likes"),
            where("postId", "==", id),
            where("userId", "==", currentUser.id)
          )
        );

        setIsLiked(!likeDoc.empty);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkUserLike();
  }, [isSignedIn, currentUser, id]);

  // Check if the current user has saved the post
  useEffect(() => {
    const checkUserSave = async () => {
      if (!isSignedIn || !currentUser || !id) return;

      try {
        const saveDoc = await getDocs(
          query(
            collection(db, "saved"),
            where("postId", "==", id),
            where("userId", "==", currentUser.id)
          )
        );

        setIsSaved(!saveDoc.empty);
      } catch (error) {
        console.error("Error checking save status:", error);
      }
    };

    checkUserSave();
  }, [isSignedIn, currentUser, id]);

  // Load comments when comment section is opened
  useEffect(() => {
    if (showComments && id) {
      loadComments();

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        query(
          collection(db, "comments"),
          where("postId", "==", id),
          orderBy("createdAt", "desc")
        ),
        (snapshot) => {
          const commentsList = [];
          snapshot.docs.forEach(async (doc) => {
            const commentData = doc.data();
            commentsList.push({
              id: doc.id,
              ...commentData,
            });
          });
          setComments(commentsList);
        }
      );

      return () => unsubscribe();
    }
  }, [showComments, id]);

  const loadComments = async () => {
    if (!id) return;

    setIsLoadingComments(true);
    try {
      const commentsSnapshot = await getDocs(
        query(
          collection(db, "comments"),
          where("postId", "==", id),
          orderBy("createdAt", "desc")
        )
      );

      const commentsList = [];
      commentsSnapshot.forEach((doc) => {
        commentsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setComments(commentsList);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Couldn't load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imagesArray.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === imagesArray.length - 1 ? 0 : prev + 1
    );
  };

  const handleLike = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to like posts");
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Find and delete the like document
        const likeQuery = query(
          collection(db, "likes"),
          where("postId", "==", id),
          where("userId", "==", currentUser.id)
        );

        const likeSnapshot = await getDocs(likeQuery);
        if (!likeSnapshot.empty) {
          await deleteDoc(doc(db, "likes", likeSnapshot.docs[0].id));
        }

        // Update local state
        setLikeCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
        toast.success("Post unliked");
      } else {
        // Create a new like document
        await addDoc(collection(db, "likes"), {
          postId: id,
          userId: currentUser.id,
          createdAt: serverTimestamp(),
        });

        // Update local state
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
        toast.success("Post liked!");
      }

      // Update the like count in the post document
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        likes: likeCount + (isLiked ? -1 : 1),
      });
    } catch (error) {
      console.error("Error updating like status:", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save posts");
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        // Find and delete the save document
        const saveQuery = query(
          collection(db, "saved"),
          where("postId", "==", id),
          where("userId", "==", currentUser.id)
        );

        const saveSnapshot = await getDocs(saveQuery);
        if (!saveSnapshot.empty) {
          await deleteDoc(doc(db, "saved", saveSnapshot.docs[0].id));
        }

        setIsSaved(false);
        toast.success("Post removed from saved");
      } else {
        // Create a new save document
        await addDoc(collection(db, "saved"), {
          postId: id,
          userId: currentUser.id,
          createdAt: serverTimestamp(),
        });

        setIsSaved(true);
        toast.success("Post saved!");
      }
    } catch (error) {
      console.error("Error updating save status:", error);
      toast.error("Failed to update save status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      // Get the current URL or create a shareable link
      const shareUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/post/${id}`
          : `https://craftly.app/post/${id}`;

      if (navigator.share) {
        await navigator.share({
          title: "Check out this craft post!",
          text:
            description?.substring(0, 100) +
            (description?.length > 100 ? "..." : ""),
          url: shareUrl,
        });
        toast.success("Post shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share:", error);
      toast.error("Failed to share post");
    }
  };

  const handleAddComment = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      // Add comment to Firestore
      await addDoc(collection(db, "comments"), {
        postId: id,
        userId: currentUser.id,
        username: currentUser.username || currentUser.firstName,
        userImage: currentUser.imageUrl,
        content: newComment.trim(),
        createdAt: serverTimestamp(),
      });

      // Clear input
      setNewComment("");
      toast.success("Comment added!");

      // No need to reload comments here since we have the real-time listener
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isSignedIn) {
      return;
    }

    try {
      await deleteDoc(doc(db, "comments", commentId));
      // Comment will be removed automatically by the real-time listener
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleDeletePost = async () => {
    if (!isSignedIn || currentUser.id !== assciateUser) {
      toast.error("You can only delete your own posts");
      return;
    }

    setIsLoading(true);
    try {
      // Delete post from Firestore
      await deleteDoc(doc(db, "posts", id));

      // Also delete all associated likes, comments, and saves
      const likesQuery = query(
        collection(db, "likes"),
        where("postId", "==", id)
      );
      const likesSnapshot = await getDocs(likesQuery);
      likesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", id)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      const savedQuery = query(
        collection(db, "saved"),
        where("postId", "==", id)
      );
      const savedSnapshot = await getDocs(savedQuery);
      savedSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      toast.success("Post deleted");

      // Call parent callback if provided
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      // Focus the comment input when opening comments
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
      {/* User Info Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.imageUrl} alt={user?.username || "User"} />
            <AvatarFallback>
              {user?.username?.[0] || user?.firstName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.username || user?.firstName || "Anonymous"}
            </span>
            {createdAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {typeof createdAt === "object" && createdAt?.toDate
                  ? formatDistanceToNow(createdAt.toDate(), { addSuffix: true })
                  : "Recently"}
              </p>
            )}
          </div>
        </div>

        <div className="relative" ref={optionsRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {isSignedIn && currentUser?.id === assciateUser && (
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2">
                      <Trash className="h-4 w-4" />
                      Delete Post
                    </div>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleShare();
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Post
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {showDeleteConfirm ? (
        <div className="p-6 flex flex-col items-center">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Delete this post?</AlertTitle>
            <AlertDescription>
              This action cannot be undone. The post and all associated comments
              will be permanently deleted.
            </AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Post"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative bg-gray-100 dark:bg-gray-700">
            <div className="aspect-square w-full flex items-center justify-center">
              <img
                src={imagesArray[currentImageIndex]}
                alt={description}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>

            {/* Carousel Navigation */}
            {hasCarousel && imagesArray.length > 1 && (
              <>
                {/* Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {imagesArray.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentImageIndex
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/75"
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Previous/Next Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Image Counter */}
                <div className="absolute top-2 right-2 bg-black/20 text-white px-2 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {imagesArray.length}
                </div>
              </>
            )}
          </div>

          <div className="p-4">
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              {description}
            </p>

            {/* Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors",
                    isLiked && "text-red-500 dark:text-red-400"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                  <span className="text-sm">{likeCount}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleComments}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{comments.length}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isLoading}
                className={cn(
                  "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors",
                  isSaved && "text-primary dark:text-primary"
                )}
              >
                <Bookmark
                  className={cn("w-5 h-5", isSaved && "fill-current")}
                />
              </motion.button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  {/* Comment Input */}
                  <div className="flex gap-2 mb-4">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={currentUser?.imageUrl}
                        alt={currentUser?.username || "User"}
                      />
                      <AvatarFallback>
                        {currentUser?.username?.[0] ||
                          currentUser?.firstName?.[0] ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex">
                      <input
                        type="text"
                        ref={commentInputRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-l-full px-4 py-2 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                        disabled={!isSignedIn || isLoading}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={
                          !isSignedIn || !newComment.trim() || isLoading
                        }
                        className="rounded-r-full bg-primary"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {isLoadingComments ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          Loading comments...
                        </p>
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={comment.userImage}
                              alt={comment.username || "User"}
                            />
                            <AvatarFallback>
                              {comment.username?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm">
                                {comment.username}
                              </span>
                              {isSignedIn &&
                                (currentUser?.id === comment.userId ||
                                  currentUser?.id === assciateUser) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              {comment.content}
                            </p>
                            {comment.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {typeof comment.createdAt === "object" &&
                                comment.createdAt?.toDate
                                  ? formatDistanceToNow(
                                      comment.createdAt.toDate(),
                                      { addSuffix: true }
                                    )
                                  : "Recently"}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </Card>
  );
}
