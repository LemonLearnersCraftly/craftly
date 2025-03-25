import React from "react";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "../../globals.css";
import SearchBar from "../../components/SearchBar";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import "../../../../styles/Header.css";
import "../../../../styles/Logo.css";
import Link from "next/link";
import ProfilePage from "./page";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body>
//           <SignedOut></SignedOut>
//           <SignedIn>
//             <UserButton />
//           </SignedIn>
//           {children}
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }

const CustomProfileLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <ClerkProvider>
      <div>
      <header className="header">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="./logo.png"
              className="h-20 w-20"
              alt="Logo"
            />
          <div className="button">
            <span className="front-text">Craftly</span>
            Craftly
          </div>
            <SearchBar />
          </div>

          <div className="flex gap-4">
            <SignedOut>
              <SignInButton fallbackRedirectUrl="/feed">
                <ShimmerButton className="shadow-2xl custom-shimmer-button">
                  <span className="whitespace-pre-wrap text-center text-sm font-black leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
                    Log In
                  </span>
                </ShimmerButton>
              </SignInButton>
              <SignUpButton signInFallbackRedirectUrl="/feed">
                <Button className="bg-custom-mint hover:bg-custom-sage text-white font-black">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
                <Link href="/feed">
                    <Button className="bg-custom-mint hover:bg-custom-sage text-white font-black">
                    Home
                    </Button>
                </Link>
                <Link href="/profile">
                    <Button className="bg-custom-mint hover:bg-custom-sage text-white font-black">
                    Profile
                    </Button>
                </Link>
                <UserButton
                    appearance={{
                    elements: {
                        avatarBox: "h-[3.75rem] w-[3.75rem]",
                    },
                    }}
                />
            </SignedIn>

          </div>
        </div>
      </header>
      {children}
      <footer className="header">
        <div className="container  md:px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="./logo.png"
                className="h-20 w-20"
              />
              <span className="text-xl font-bold text-custom-sage">
                Craftly
              </span>
            </div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Craftly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </ClerkProvider>
  );
};

export default CustomProfileLayout;
