"use client";

import ProfileDetails from "@/components/Profile";
import "../../../../styles/ProfilePage.css";

export default function ProfilePage({ user }: { user: any }) {
  return (
    <div className="profile-page">
      <h1>Welcome, {user?.name || "User"}!</h1>
      <div className="profile-details-section">
        <ProfileDetails user={user} />
      </div>
    </div>
  );
}