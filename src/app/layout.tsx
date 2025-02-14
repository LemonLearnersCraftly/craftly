import React from "react";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import "../../styles/Header.css";
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

const Header = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <footer className="border-t bg-white">
            <div className="container  md:px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="./logo.png"
                    className="h-14 w-14 border-2 border-gray-800 rounded-full"
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
        </body>
      </html>
    </ClerkProvider>
  );
};

export default Header;
