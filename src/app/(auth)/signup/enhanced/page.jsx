// src/app/(auth)/signup/enhanced/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import UserPreferences from "@/components/UserPreferences";
import { Progress } from "@/components/ui/progress";
import { db } from "@/utils/firestore";
import { doc, setDoc } from "firebase/firestore";
import { UserSchema, UserConverter } from "@/models/Users";

export default function EnhancedSignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);

  useEffect(() => {
    // If user is already signed in, they're in the preferences step
    if (isSignedIn && user) {
      setStep(2);
      setProgress(66);
    }
  }, [isSignedIn, user]);

  const handlePreferencesComplete = async (preferences) => {
    setProgress(100);
    // Create or update user document with preferences
    const userDocRef = doc(db, "users", user.id).withConverter(UserConverter);
    try {
      const newUser = new UserSchema(
        user.id,
        user.imageUrl || "",
        user.username || user.firstName || "",
        user.primaryEmailAddress?.emailAddress || ""
      );

      // Set preferences if they exist
      if (preferences) {
        newUser.interests = preferences;
      }

      await setDoc(userDocRef, UserConverter.toFirestore(newUser));

      // Redirect to feed after preferences are saved
      router.push("/feed");
    } catch (error) {
      console.error("Error creating user profile:", error);
      // Redirect anyway, but user might need to set preferences later
      router.push("/feed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Progress header */}
      <div className="w-full bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Step {step} of 2</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {step === 1 && !isSignedIn && (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-custom-sage">
                Create your Craftly account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Join our community of crafters and makers
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {/* This is where the Clerk SignUp component would go */}
              <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                Please sign up with your email or social accounts
              </p>

              {/* Placeholder for the actual Clerk SignUp component */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                Clerk SignUp Component Would Be Here
                <button
                  onClick={() => {
                    // This is a mockup - in reality this happens after Clerk signup
                    setStep(2);
                    setProgress(66);
                  }}
                  className="mt-4 px-4 py-2 bg-custom-mint text-white rounded-lg"
                >
                  Simulate Signup Completion
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-4xl">
            <UserPreferences
              isSignUp={true}
              onComplete={handlePreferencesComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
