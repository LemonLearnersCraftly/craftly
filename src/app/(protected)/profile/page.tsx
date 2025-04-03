import Profile from "@/components/Profile";
import ProfilePostsGrid from "@/components/ProfilePostsGrid";
import "../../../../styles/Profile.css";

export default function ProfilePage() {
  return (
    <div className="profile-page-container">
      <div className="profile-wrapper">
        <Profile />
      </div>
      
      <div className="posts-wrapper">
        <h2 className="profile-posts-title">My Posts</h2>
        <ProfilePostsGrid />
      </div>
    </div>
  );
}