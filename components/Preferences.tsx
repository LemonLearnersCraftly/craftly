// components/Preferences.tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserConverter, UserSchema } from "../models/Users";
import { db } from "../utils/firebaseConfig";
import { Button } from "./ui/button";
import { ShimmerButton } from "./magicui/shimmer-button";

// Define the structure for an interest item
interface InterestItem {
  imageUrl: string;
  text: string;
  color: string;
}

export default function Preferences() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Craft items with assigned colors for consistent styling
  const items: InterestItem[] = [
    {
      imageUrl: "/crafts/knitting.png",
      text: "Knitting",
      color: "bg-blue-500",
    },
    {
      imageUrl: "/crafts/crochet.png",
      text: "Crochet",
      color: "bg-purple-500",
    },
    {
      imageUrl: "/crafts/embroidary.png",
      text: "Embroidery",
      color: "bg-pink-500",
    },
    {
      imageUrl: "/crafts/paper.png",
      text: "Paper Crafts",
      color: "bg-yellow-500",
    },
    {
      imageUrl: "/crafts/ceramics.png",
      text: "Ceramics",
      color: "bg-amber-600",
    },
    { imageUrl: "/crafts/felting.png", text: "Felting", color: "bg-green-600" },
    { imageUrl: "/crafts/sewing.png", text: "Sewing", color: "bg-red-500" },
    {
      imageUrl: "/crafts/jewelery.png",
      text: "Jewelery Making",
      color: "bg-indigo-500",
    },
    {
      imageUrl: "/crafts/candle.png",
      text: "Candle Making",
      color: "bg-lime-500",
    },
  ];

  // Effect to fetch existing preferences when user data is available
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, "users", user.id).withConverter(
          UserConverter
        );
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Ensure interests and items exist before setting state
          if (userData?.interests?.items) {
            setSelectedItems(userData.interests.items);
          }
        }
      } catch (err) {
        console.error("Error fetching preferences:", err);
        setError("Could not load your existing preferences.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, [user, isLoaded]);

  const handleCardClick = (item: InterestItem) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(item.text)) {
        return prevSelectedItems.filter(
          (selectedItem) => selectedItem !== item.text
        );
      } else {
        return [...prevSelectedItems, item.text];
      }
    });
  };

  const savePreferences = async () => {
    if (!user) {
      setError("User not found. Please sign in again.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userDocRef = doc(db, "users", user.id).withConverter(UserConverter);
      const userDocSnap = await getDoc(userDocRef);

      const interestsData = {
        total: selectedItems.length,
        items: selectedItems,
      };

      if (userDocSnap.exists()) {
        // Update existing user document
        const userData = userDocSnap.data();
        const updatedUser = new UserSchema(
          userData.id,
          userData.username ||
            user.username ||
            user.emailAddresses[0]?.emailAddress.split("@")[0] ||
            "Crafter",
          userData.email || user.emailAddresses[0]?.emailAddress || "",
          userData.following,
          userData.posts,
          interestsData
        );

        await setDoc(userDocRef, updatedUser);
      } else {
        // Create new user document
        const newUser = new UserSchema(
          user.id,
          user.username ||
            user.emailAddresses[0]?.emailAddress.split("@")[0] ||
            "Crafter",
          user.emailAddresses[0]?.emailAddress || "",
          { total: 0, items: [] },
          { total: 0, items: [] },
          interestsData
        );

        await setDoc(userDocRef, newUser);
      }

      // Redirect to feed
      router.push("/feed");
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Failed to save preferences. Please try again.");
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-32 w-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-custom-sage text-center">
          What crafts do you love?
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Select your favorite crafts to personalize your experience
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(item)}
              className={`
                relative cursor-pointer transition-all duration-300 ease-in-out
                bg-white border rounded-xl shadow-md overflow-hidden
                transform hover:-translate-y-1 hover:shadow-lg
                ${
                  selectedItems.includes(item.text)
                    ? "ring-4 ring-custom-mint scale-105"
                    : ""
                }
              `}
            >
              <div className="p-2 text-center">
                <div className="aspect-square flex items-center justify-center p-2">
                  <img
                    src={item.imageUrl}
                    alt={item.text}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className={`${item.color} text-white text-sm font-medium py-1 px-2 rounded-full mt-2`}
                >
                  {item.text}
                </div>
              </div>

              {selectedItems.includes(item.text) && (
                <div className="absolute top-2 right-2 bg-custom-mint text-white rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <ShimmerButton
            onClick={savePreferences}
            disabled={saving || selectedItems.length === 0}
            className="w-full max-w-xs py-4"
          >
            <span className="font-bold">
              {saving ? "Saving..." : "Save & Continue"}
            </span>
          </ShimmerButton>
        </div>

        {selectedItems.length === 0 && (
          <p className="text-amber-600 text-center mt-4 text-sm">
            Please select at least one craft to continue
          </p>
        )}
      </div>
    </div>
  );
}
