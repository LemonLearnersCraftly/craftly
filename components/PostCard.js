import React from 'react';
import '../styles/PostCard.css';

const PostCard = ({ image, description }) => {
    return (
        <div className="post-card">
            <img src={image} className="post-image"/>
            <div className="post-description">
                {description || 'Default description'} 
            </div>
            <div className="post-actions">
                <button>
                    <img src="/heart.jpg"/>
                </button>
                <button> 
                    <img src="/comment.jpg"/>
                </button>
            </div>
        </div>
    );
};

export default PostCard;