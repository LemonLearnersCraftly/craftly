// src/app/layout.tsx
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import NavigationMenu from "@/components/NavigationMenu";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Craftly - Connect with Craft Enthusiasts",
  description:
    "Share your craft projects, discover patterns, and connect with a vibrant community of crafters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-50 min-h-screen flex flex-col">
          <NavigationMenu />
          <main className="flex-1 pb-5 md:pb-0">{children}</main>
          <Footer />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
