// app/feed/page.tsx (Server Component)
import { currentUser } from "@clerk/nextjs/server";
import FeedClient from "./FeedClient";
import PostButton from "@/components/PostButton";

export default async function FeedPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Sign in to view this page</div>;
  }

  return (
    <>
      <FeedClient user={user.id} />
      <PostButton />
    </>
  );
}
