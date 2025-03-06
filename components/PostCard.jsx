"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function PostCard({
  image,
  description,
  hasCarousel,
  images,
  user,
}) {
  console.log(user);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleLike = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement like functionality with Firestore
      setIsLiked(!isLiked);
      toast.success(isLiked ? "Post unliked" : "Post liked!");
    } catch (error) {
      toast.error("Failed to update like status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save functionality with Firestore
      setIsSaved(!isSaved);
      toast.success(isSaved ? "Post removed from saved" : "Post saved!");
    } catch (error) {
      toast.error("Failed to update save status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl">
      {/* User Info Bar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <img
          src={user?.imageUrl}
          alt={`${user?.username || user?.firstName}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {user?.username || user?.firstName}
        </span>
      </div>

      <div className="relative bg-gray-100 dark:bg-gray-700">
        <div className="aspect-square w-full flex items-center justify-center">
          <img
            src={hasCarousel ? images[currentImageIndex] : image}
            alt={description}
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
        </div>

        {/* Carousel Navigation */}
        {hasCarousel && images.length > 1 && (
          <>
            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
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
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <p className="text-gray-800 dark:text-gray-200 mb-4">{description}</p>

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
              <span className="text-sm">Like</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Comment</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share</span>
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
            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
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
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Comments coming soon...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
