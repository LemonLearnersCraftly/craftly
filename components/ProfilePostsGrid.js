import React from 'react';
import PostCard from './PostCard';
import '../styles/ProfilePostsGrid.css'; 

const ProfilePostsGrid = () => {
    const posts = [
        {
            id: 1, 
            image: '/postImage.jpg',
            description: 'My way of relaxing on a day off',
        }, 
        {
            id: 2, 
            image: '/postImage.jpg',
            description: 'My way of relaxing on a day off',
        },
        // Add more posts as needed
    ];

    return (
        <div className="profile-posts-grid">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    image={post.image}
                    description={post.description}
                />
            ))}
        </div>
    );
};

export default ProfilePostsGrid;