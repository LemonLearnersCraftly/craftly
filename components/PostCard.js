import React from 'react';
import '../styles/PostCard.css';
import '../styles/Like.css'

const PostCard = ({ image, description }) => {
    return (
        <div className="post-card">
            <img src={image} className="post-image"/>
            <div className="post-description">
                {description || 'Default description'} 
            </div>
            <div className="post-actions">
            <div className="heart-container">
                    <input type="checkbox" className="checkbox" id="like-checkbox" />
                    <div className="svg-container">
                        {/* SVG for unfilled heart (outline) */}
                        <svg
                            className="svg-outline"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="30"
                            height="30"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                        </svg>
                        {/* SVG for filled heart */}
                        <svg
                            className="svg-filled"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="30"
                            height="30"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                        </svg>
                        {/* SVG for celebration animation */}
                        <svg
                            className="svg-celebrate"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="50"
                            height="50"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                        </svg>
                    </div>
                </div>
    <div className="group relative">
  <button>
    <svg
      strokeLinejoin="round"
      strokeLinecap="round"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      height="44"
      width="44"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 hover:scale-125 duration-200 hover:stroke-blue-500"
      fill="none"
    >
      <path fill="none" d="M0 0h24v24H0z" stroke="none"></path>
      <path d="M8 9h8"></path>
      <path d="M8 13h6"></path>
      <path
        d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"
      ></path>
    </svg>
  </button>
  <span
    className="absolute -top-14 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100"
    >Comment <span> </span
  ></span>
    </div>

            </div>
        </div>
    );
};

export default PostCard;