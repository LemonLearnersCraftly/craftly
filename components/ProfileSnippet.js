"use client";

import { useUser } from "@clerk/nextjs";
import "../styles/ProfileSnippet.css";
import { useRouter } from "next/navigation";

const ProfileSnippet = () => {
  const { user } = useUser();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="profile-snippet">
      <img src={user.imageUrl || "/frog.jpg"} alt="Profile" className="profile-image" />

      <h2 className="profile-name">
        {user.firstName} {user.lastName}
      </h2>
      <p className="profile-username">@{user.username || "User"}</p>
      <p className="profile-bio">{user.publicMetadata?.bio || "I am a frog and I love doing crafts"}</p>

      <button onClick={() => router.push("/profile")} className="edit-profile-btn">
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileSnippet;
