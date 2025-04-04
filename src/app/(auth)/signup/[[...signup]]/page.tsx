// src/app/(auth)/signup/[[...signup]]/page.tsx
"use client";
import { SignUp } from "@clerk/nextjs";
import "./signup.css";
import Link from "next/link";
import { shadesOfPurple } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 text-white flex justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Craftly Logo"
            className="h-10 w-10 border-2 border-gray-200 rounded-full"
          />
          <span>Craftly</span>
        </Link>
        <Link href="/signin" className="text-white hover:underline">
          Sign In
        </Link>
      </nav>

      <div className="flex flex-col justify-center items-center flex-grow p-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Join Craftly</h1>
          <p className="text-gray-600 mb-6 text-center">
            Connect with fellow crafters and share your creations
          </p>
          <SignUp
            appearance={{
              baseTheme: [shadesOfPurple],
              elements: {
                rootBox: "w-full",
                card: "rounded-xl shadow-lg",
              },
            }}
            redirectUrl="/preferencesFile"
          />
        </div>
      </div>
    </div>
  );
}
