// "use client";

// import { useEffect, useState } from "react";
import Feed from "@/components/Feed";
import Articles from "@/components/Articles";
import "../../../styles/Homepage.css";
// import { getRecentPosts } from "@/utils/firestoreUtils";
import { currentUser } from "@clerk/nextjs/server";

// This function will render components for feed page
// all url routes to /feed will render this component

const FeedPage = async () => {
  // const { isLoaded, session, isSignedIn } = useSession();
  const user = await currentUser();

  //   const [posts, setPosts] = useState([]);

  //   useEffect(() => {
  //     const fetchPosts = async () => {
  //       const result = await getRecentPosts();
  //       if (result.success) {
  //         setPosts(result.posts);
  //       }
  //     };
  //     fetchPosts();
  //   }, []);

  if (!user) {
    return <div>Sign in to view this page</div>;
  } else {
    return (
      <div className="homepage">
        {/* <div>Welcome, {user.firstName}!</div> */}
        <div className="content">
          <div className="feed-section">
            <Feed />
          </div>
          <div className="articles-section">
            <Articles />
          </div>
        </div>
      </div>
    );
  }
};

export default FeedPage;
