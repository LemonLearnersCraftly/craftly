"use client";
import { SignUp } from "@clerk/nextjs";
import "./signup.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { shadesOfPurple } from "@clerk/themes";

export default function Page() {
  const router = useRouter();
  const handleSignUpComplete = () => {
    router.push("/preferencesFile");
  };
  useEffect(() => {
    const handleSignUpComplete = (event: Event) => {
      if ((event as CustomEvent).detail.url === "/preferencesFIle") {
        router.push("/preferencesFile");
      }
    };

    window.addEventListener("redirect", handleSignUpComplete);

    return () => {
      window.removeEventListener("redirect", handleSignUpComplete);
    };
  }, [router]);

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
          forceRedirectUrl={"/preferencesFile"}
          appearance={{
            baseTheme: [shadesOfPurple],
          }}
        />
      </div>
      <button onClick={() => router.push("/preferencesFile")}>
        Go to Preferences
      </button>
    </div>
  );
}
