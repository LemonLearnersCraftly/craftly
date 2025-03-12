"use client";

import { useUser } from "@clerk/nextjs";
import "../styles/ProfileSnippet.css"; 

const ProfileSnippet = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="profile-snippet">
      <img src={user.imageUrl} alt="Profile" className="profile-image" />

      <h2 className="profile-name">
        {user.firstName} {user.lastName}
      </h2>
      <p className="profile-username">@{user.username || "User"}</p>
      <p className="profile-bio">{user.publicMetadata?.bio || "No bio available"}</p>

      <button className="edit-profile-btn">Edit Profile</button> {/* edit to lead to profile page when clicked */}
    </div>
  );
};

export default ProfileSnippet;


