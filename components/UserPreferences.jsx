// components/UserPreferences.jsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/firestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { UserSchema, UserConverter } from "@/models/Users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Add this Badge component if it doesn't exist
// This goes in a new file: components/ui/badge.jsx
/* 
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />)
}

export { Badge, badgeVariants }
*/

// Craft categories with subcategories
const CRAFT_CATEGORIES = {
  knitting: {
    name: "Knitting",
    subcategories: [
      "Beginner",
      "Intermediate",
      "Advanced",
      "Patterns",
      "Techniques",
      "Tools",
    ],
    color: "bg-blue-500 hover:bg-blue-600",
  },
  crochet: {
    name: "Crochet",
    subcategories: [
      "Amigurumi",
      "Garments",
      "Home Decor",
      "Beginner",
      "Advanced",
      "Patterns",
    ],
    color: "bg-purple-500 hover:bg-purple-600",
  },
  sewing: {
    name: "Sewing",
    subcategories: [
      "Machine Sewing",
      "Hand Sewing",
      "Quilting",
      "Embroidery",
      "Clothing",
      "Accessories",
    ],
    color: "bg-pink-500 hover:bg-pink-600",
  },
  paperCrafts: {
    name: "Paper Crafts",
    subcategories: [
      "Scrapbooking",
      "Card Making",
      "Origami",
      "Quilling",
      "Paper Art",
    ],
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  woodworking: {
    name: "Woodworking",
    subcategories: [
      "Carving",
      "Furniture Making",
      "Small Projects",
      "Turning",
      "Techniques",
    ],
    color: "bg-amber-600 hover:bg-amber-700",
  },
  jewelry: {
    name: "Jewelry Making",
    subcategories: ["Beading", "Wire Work", "Metal Smithing", "Resin", "Clay"],
    color: "bg-teal-500 hover:bg-teal-600",
  },
  painting: {
    name: "Painting",
    subcategories: [
      "Watercolor",
      "Acrylic",
      "Oil Painting",
      "Mixed Media",
      "Digital",
    ],
    color: "bg-red-500 hover:bg-red-600",
  },
  drawing: {
    name: "Drawing",
    subcategories: [
      "Sketching",
      "Illustration",
      "Lettering",
      "Digital Art",
      "Comics",
    ],
    color: "bg-orange-500 hover:bg-orange-600",
  },
  pottery: {
    name: "Pottery & Ceramics",
    subcategories: [
      "Hand Building",
      "Wheel Throwing",
      "Glazing",
      "Sculpting",
      "Firing Techniques",
    ],
    color: "bg-stone-500 hover:bg-stone-600",
  },
  diy: {
    name: "DIY & Home Decor",
    subcategories: [
      "Upcycling",
      "Home Decor",
      "Furniture Makeovers",
      "Seasonal Crafts",
      "Organization",
    ],
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
};

export default function UserPreferences({
  isSignUp = false,
  onComplete,
  initialPreferences = {},
}) {
  const { user, isLoaded } = useUser();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If editing existing preferences, load them
    if (!isSignUp && user && Object.keys(initialPreferences).length > 0) {
      if (initialPreferences.items) {
        const categoriesFromPrefs = [];
        const subcategoriesFromPrefs = {};

        // Parse the preferences into our format
        initialPreferences.items.forEach((pref) => {
          if (pref.category && !categoriesFromPrefs.includes(pref.category)) {
            categoriesFromPrefs.push(pref.category);
          }

          if (pref.category && pref.subcategory) {
            if (!subcategoriesFromPrefs[pref.category]) {
              subcategoriesFromPrefs[pref.category] = [];
            }
            if (
              !subcategoriesFromPrefs[pref.category].includes(pref.subcategory)
            ) {
              subcategoriesFromPrefs[pref.category].push(pref.subcategory);
            }
          }
        });

        setSelectedCategories(categoriesFromPrefs);
        setSelectedSubcategories(subcategoriesFromPrefs);

        // Set active category to the first selected one if any
        if (categoriesFromPrefs.length > 0) {
          setActiveCategory(categoriesFromPrefs[0]);
        }
      }
    }
  }, [isSignUp, user, initialPreferences]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // If removing a category, also remove its subcategories
        const newSubcategories = { ...selectedSubcategories };
        delete newSubcategories[category];
        setSelectedSubcategories(newSubcategories);
        return prev.filter((c) => c !== category);
      } else {
        setActiveCategory(category);
        return [...prev, category];
      }
    });
  };

  const toggleSubcategory = (category, subcategory) => {
    setSelectedSubcategories((prev) => {
      const currentSubcategories = prev[category] || [];
      if (currentSubcategories.includes(subcategory)) {
        return {
          ...prev,
          [category]: currentSubcategories.filter((s) => s !== subcategory),
        };
      } else {
        return {
          ...prev,
          [category]: [...currentSubcategories, subcategory],
        };
      }
    });
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Format preferences for storage
      const userPreferences = [];
      selectedCategories.forEach((category) => {
        // Add the main category
        userPreferences.push({ category });

        // Add subcategories if any are selected
        const subcategories = selectedSubcategories[category] || [];
        subcategories.forEach((subcategory) => {
          userPreferences.push({ category, subcategory });
        });
      });

      // Get user document reference
      const userDocRef = doc(db, "users", user.id).withConverter(UserConverter);

      // Get current user data or create new user object
      const userDoc = await getDoc(userDocRef);
      let userData;

      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        userData = new UserSchema(
          user.id,
          user.imageUrl || "",
          user.username || user.firstName || "",
          user.primaryEmailAddress?.emailAddress || ""
        );
      }

      // Update interests with new preferences
      userData.interests = {
        total: userPreferences.length,
        items: userPreferences,
      };

      // Save to Firestore
      await updateDoc(userDocRef, UserConverter.toFirestore(userData));

      toast.success("Preferences saved successfully!");

      if (onComplete) {
        onComplete(userData.interests);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-custom-sage">
          {isSignUp
            ? "Tell us what you love to craft!"
            : "Your Crafting Interests"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Select the crafts you're interested in to personalize your experience."
            : "Update your crafting interests to see more relevant content."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Craft Categories</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(CRAFT_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                className={`px-4 py-2 rounded-full text-white transition-all ${
                  selectedCategories.includes(key)
                    ? category.color + " ring-2 ring-offset-2 ring-blue-400"
                    : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {selectedCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">
              Tell us more about your interests
            </h3>
            <Tabs
              defaultValue={selectedCategories[0]}
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="mb-4 flex flex-wrap h-auto">
                {selectedCategories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="px-4 py-2"
                  >
                    {CRAFT_CATEGORIES[category]?.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {selectedCategories.map((category) => (
                <TabsContent key={category} value={category} className="pt-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {CRAFT_CATEGORIES[category]?.subcategories.map(
                      (subcategory) => (
                        <button
                          key={subcategory}
                          onClick={() =>
                            toggleSubcategory(category, subcategory)
                          }
                          className={`px-3 py-1.5 border rounded-full text-sm transition-all ${
                            selectedSubcategories[category]?.includes(
                              subcategory
                            )
                              ? `bg-${category}-100 border-${category}-300 text-${category}-800 dark:bg-${category}-900 dark:text-${category}-100`
                              : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                          }`}
                        >
                          {subcategory}
                        </button>
                      )
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Selected Interests</h3>
          {selectedCategories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No interests selected yet
            </p>
          ) : (
            <div className="space-y-4">
              {selectedCategories.map((category) => (
                <div
                  key={category}
                  className="border rounded-lg p-3 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {CRAFT_CATEGORIES[category]?.name}
                    </h4>
                    <Badge variant="secondary">
                      {(selectedSubcategories[category] || []).length} selected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedSubcategories[category] || []).map(
                      (subcategory) => (
                        <Badge
                          key={subcategory}
                          variant="outline"
                          className="px-2 py-1"
                        >
                          {subcategory}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 pt-6">
        {!isSignUp && (
          <Button variant="outline" onClick={() => onComplete()}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSavePreferences}
          disabled={selectedCategories.length === 0 || isLoading}
          className="bg-custom-mint hover:bg-custom-sage text-white"
        >
          {isLoading ? "Saving..." : isSignUp ? "Continue" : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
}
