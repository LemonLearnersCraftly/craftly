// /components/Preferences.tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "./PreferencesItemCard"; // Assuming path is correct
// Import Firestore instance and necessary functions directly
import db from "../utils/firestore"; // Assuming db is exported from here
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { UserConverter, UserSchema } from "../models/Users"; // Ensure paths are correct
import { Button } from "./ui/button"; // For loading/feedback

// Define the structure for an interest item
interface InterestItem {
  imageUrl: string;
  text: string;
}

export default function Preferences() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For save button
  const [error, setError] = useState<string | null>(null); // For feedback

  // Hardcoded items - consider fetching these from Firestore if they might change
  const items: InterestItem[] = [
    { imageUrl: "/crafts/knitting.png", text: "Knitting" },
    { imageUrl: "/crafts/crochet.png", text: "Crochet" },
    { imageUrl: "/crafts/embroidary.png", text: "Embroidery" },
    { imageUrl: "/crafts/paper.png", text: "Paper Crafts" },
    { imageUrl: "/crafts/ceramics.png", text: "Ceramics" },
    { imageUrl: "/crafts/felting.png", text: "Felting" },
    { imageUrl: "/crafts/sewing.png", text: "Sewing" },
    { imageUrl: "/crafts/jewelery.png", text: "Jewelery Making" },
    { imageUrl: "/crafts/candle.png", text: "Candle Making" },
  ];

  // Effect to fetch existing preferences when user data is available
  useEffect(() => {
    if (isLoaded && user) {
      const fetchPreferences = async () => {
        setIsLoading(true); // Indicate loading existing prefs
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
          // If doc doesn't exist, selectedItems remains empty, which is correct
        } catch (err) {
          console.error("Error fetching preferences:", err);
          setError("Could not load existing preferences.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPreferences();
    }
  }, [user, isLoaded]); // Depend on user and isLoaded

  const handleCardClick = (item: InterestItem) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(item.text)) {
        return prevSelectedItems.filter(
          (selectedItem) => selectedItem !== item.text
        );
      } else {
        // Limit selection if needed (e.g., max 5 interests)
        // if (prevSelectedItems.length < 5) {
        return [...prevSelectedItems, item.text];
        // }
        // return prevSelectedItems; // Or provide feedback about limit
      }
    });
  };

  const savePreferences = async () => {
    if (!user) {
      setError("User not found. Please sign in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userDocRef = doc(db, "users", user.id).withConverter(UserConverter);
      const userDocSnap = await getDoc(userDocRef);

      const interestsData = {
        total: Number(selectedItems.length),
        items: selectedItems,
      };

      if (userDocSnap.exists()) {
        // --- Document EXISTS: Update only the interests ---
        await updateDoc(userDocRef, {
          interests: interestsData,
          // Optionally update a 'lastUpdated' timestamp
          // lastUpdatedAt: serverTimestamp()
        });
        console.log("Preferences updated successfully");
      } else {
        // --- Document DOES NOT EXIST: Create it ---
        // Use basic info from Clerk, add interests, and set creation timestamp
        const newUser = new UserSchema(
          user.id,
          user.username ||
            user.emailAddresses[0]?.emailAddress.split("@")[0] ||
            "New User", // Get username or derive from email
          user.emailAddresses[0]?.emailAddress || "", // Get primary email
          undefined, // Default following
          undefined, // Default posts
          interestsData // Set the selected interests
        );
        // Add creation timestamp if needed in your schema
        // newUser.createdAt = serverTimestamp(); // Example, adjust schema if needed

        await setDoc(userDocRef, newUser); // setDoc with converter handles the toFirestore conversion
        console.log("User document created and preferences saved successfully");
      }

      // Redirect to the main feed after successful save
      router.push("/feed"); // Corrected redirect target
    } catch (e) {
      console.error("Error saving preferences:", e);
      setError("Failed to save preferences. Please try again.");
      setIsLoading(false); // Ensure loading state is reset on error
    }
    // No finally block needed here for setIsLoading, as it's handled on error or success redirect
  };

  if (!isLoaded) {
    // Optional: Show a loading indicator while Clerk loads
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading user...
      </div>
    );
  }

  if (!user) {
    // Should ideally not happen if routed correctly, but good to handle
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Please sign in to set preferences.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <h1 className="text-2xl font-bold mb-6 text-white">
        What crafts do you love?
      </h1>
      <p className="text-sm text-gray-400 mb-4">
        Select a few to personalize your feed.
      </p>
      {isLoading && <p className="text-blue-400 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {items.map((item, index) => (
          <Card
            key={index}
            imageUrl={item.imageUrl}
            text={item.text}
            isSelected={selectedItems.includes(item.text)} // Pass selection state
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>
      <Button
        onClick={savePreferences}
        disabled={isLoading || selectedItems.length === 0} // Disable if loading or no items selected
        className="mt-4 p-2 bg-custom-mint hover:bg-custom-sage text-white rounded disabled:opacity-50"
      >
        {isLoading ? "Saving..." : "Save Preferences & Continue"}
      </Button>
    </div>
  );
}
