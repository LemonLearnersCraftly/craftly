// src/app/(auth)/signup/[[...signup]]/page.tsx
"use client";
import { SignUp } from "@clerk/nextjs";
import "./signup.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Removed useEffect import
import { shadesOfPurple } from "@clerk/themes";

export default function Page() {
  const router = useRouter(); // Keep router if needed for other purposes, like the explicit button

  // Removed useEffect hook for redirection

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 text-white flex justify-between">
        <h1 className="text-xl font-bold">Craftly</h1>
        <Link href="/" className="text-white hover:underline">
          Home
        </Link>
      </nav>

      <div className="flex flex-col justify-center items-center flex-grow">
        <SignUp
          // Use afterSignUpUrl for standard flow, Clerk handles the redirect
          forceRedirectUrl={"/preferencesFile"}
          // Keep signInUrl if you want them redirected to sign-in if they navigate here wrongly
          // signInUrl="/signin" // Example
          appearance={{
            baseTheme: [shadesOfPurple],
          }}
        />
      </div>
      {/* Optional: Keep button if needed for manual navigation, but primary flow is automatic */}
      {/* <button onClick={() => router.push('/preferencesFile')}>Go to Preferences</button> */}
    </div>
  );
}
