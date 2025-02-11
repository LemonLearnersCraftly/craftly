"use client";

import AddItem from "../../components/AddItem";
import { useUser, SignInButton, SignUpButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// This file will render components for home page
// Work in auth folder for authentication: signin, register, signout
// Work in home folder (Debatable) to create a more specific layout

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 
  }, []);

  if (!isClient) {
    return null; // Don't render anything until client-side hydration is complete
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 text-white flex justify-between fixed top-0 left-0 z-10">
        <h1 className="text-xl font-bold">MyApp</h1>
        <div>
          {isSignedIn ? (
            <>
              <UserButton />
              <SignOutButton />
            </>
          ) : (
            <>
              <SignInButton />
              <SignUpButton />
            </>
          )}
        </div>
      </nav>

      {/* Add Item */}
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        {isSignedIn ? (
          <>
            <h1 className="text-2xl font-bold text-black">Welcome, {user?.firstName} 👋</h1>
            <AddItem />
          </>
        ) : (
          <h1 className="text-2xl font-bold text-black">Please Sign In to Add Items</h1>
        )}
      </div>
    </div>
  );
}