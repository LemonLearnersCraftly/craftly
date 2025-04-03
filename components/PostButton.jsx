// components/PostButton.jsx
"use client";
import { useState } from "react";
import CreatePostForm from "./CreatePostForm";
import { Trash2 } from "lucide-react";

export default function PostButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handlePostCreated = (post) => {
    // You could add additional logic here, like refreshing the feed
    closeModal();
  };

  return (
    <>
      <button
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center border-none shadow-lg hover:scale-105 transition-all duration-200 z-50"
        onClick={openModal}
        aria-label="Create new post"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4V20M4 12H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg p-5 w-[90%] max-w-[500px] relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2.5 right-2.5 bg-transparent border-none text-2xl cursor-pointer hover:text-gray-600 transition-colors"
              onClick={closeModal}
            >
              &times;
            </button>
            <CreatePostForm onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}
    </>
  );
}
