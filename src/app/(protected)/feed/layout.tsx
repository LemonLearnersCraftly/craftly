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

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import "../../../../styles/Header.css";
import Link from "next/link";

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

const CustomFeedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ClerkProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <img
              src="./logo.png"
              className="h-14 w-14 border-2 border-primary-500 rounded-full"
            />
            <span className="text-xl font-bold text-primary-500">Craftly</span>
          </div>
          <div className="flex justify-center items-center w-[40%]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 8l4 4m0 0l-4 4m4-4H4m16 0h-4"
              />
            </svg>
            <input type="text" placeholder="Search..." className="search-bar" />
          </div>

          <div className="flex gap-4">
            <SignedOut>
              <SignInButton fallbackRedirectUrl="/feed">
                <ShimmerButton className="bg-surface-100 hover:bg-surface-200 text-foreground shadow-surface">
                  <span className="whitespace-pre-wrap text-center text-sm font-black leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
                    Log In
                  </span>
                </ShimmerButton>
              </SignInButton>
              <SignUpButton signInFallbackRedirectUrl="/feed">
                <Button className="bg-primary-500 hover:bg-primary-500 text-white font-black">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
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
      <footer className="border-t bg-white">
        <div className="container  md:px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="./logo.png"
                className="h-14 w-14 border-2 border-primary-500 rounded-full"
              />
              <span className="text-xl font-bold text-primary-500">
                Craftly
              </span>
            </div>
            <p className="text-sm text-primary-500">
              © {new Date().getFullYear()} Craftly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </ClerkProvider>
  );
};

export default CustomFeedLayout;
