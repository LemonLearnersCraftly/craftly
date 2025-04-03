import React from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

const PostCard = ({ image, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=90"
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Sarah Johnson
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              2 hours ago
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 dark:text-gray-200 mb-4">
          {description || "Default description"}
        </p>
        <img
          src={image}
          className="w-full rounded-lg object-cover mb-4"
          alt="Post content"
        />
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">24</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">12</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
