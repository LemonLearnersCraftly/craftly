// src/app/(protected)/feed/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FeedClient from "./FeedClient";

export const metadata = {
  title: "Feed | Craftly",
  description: "Discover and connect with craft enthusiasts on Craftly",
};

export default async function FeedPage() {
  const user = await currentUser();

  // If no user is found, redirect to sign in
  if (!user) {
    redirect("/signin");
  }

  return <FeedClient />;
}
