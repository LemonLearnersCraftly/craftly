"use client";

import { useUser } from "@clerk/nextjs";
import "../styles/Profile.css";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { user } = useUser();
  const router = useRouter();

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <img src={user.imageUrl || "/frog.jpg"} alt="Profile" className="profile-image" />
      
      <h2 className="profile-name">
        {user.firstName} {user.lastName}
      </h2>
      <p className="profile-username">@{user.username || "User"}</p>
      <p className="profile-bio">{user.publicMetadata?.bio || "I am a frog and I love doing crafts"}</p>

      <button onClick={() => router.push("/profile/edit")} className="edit-profile-btn">
        Edit Profile
      </button>
    </div>
  );
};

export default Profile;
