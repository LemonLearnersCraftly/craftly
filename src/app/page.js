"use client";

import React, {useEffect, useState} from 'react';
import Feed from '../../components/Feed';
import Header from '../../components/Header';
import Articles from '../../components/Articles';
import '../../styles/Homepage.css'
import { getRecentPosts } from '../../utils/firestoreUtils';

const HomePage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const result = await getRecentPosts();
            if(result.success) {
                setPosts(result.posts);
            }
        };
        fetchPosts();
    }, [])

    return (
        <div className="homepage">
            <Header />
            <div className='content'>
                <div className="feed-section">
                    <Feed posts={posts}/>
                </div>
                <div className='articles-section'>
                    <Articles />
                </div>
            </div>
        </div>
    );
};

export default HomePage;

/*import AddItem from "../../components/AddItem";

// This file will render components for home page
// Work in auth folder for authentication: signin, register, signout
// Work in home folder (Debatable) to create a more specific layout

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      <AddItem />
    </div>
  );
}*/
