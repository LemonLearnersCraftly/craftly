"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Compass,
  Bookmark,
  PlusSquare,
  User,
  BookOpen,
  Scissors,
  Search,
  Menu,
  X,
  User2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ShimmerButton } from "./magicui/shimmer-button";
import PostEditor from "./PostEditorModal";
import { useRouter } from "next/navigation";

export default function NavigationMenu() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleClickProfile = () => {
    if (user) {
      router.push(`/profile/${user.id}`);
    }
  };

  const routes = [
    { name: "Feed", path: "/feed", icon: Home, requiresAuth: true },
    { name: "Discover", path: "/discover", icon: Compass, requiresAuth: false },
    {
      name: "Patterns",
      path: "/patterns",
      icon: Scissors,
      requiresAuth: false,
    },
    {
      name: "Tutorials",
      path: "/tutorials",
      icon: BookOpen,
      requiresAuth: false,
    },
    { name: "Saved", path: "/saved", icon: Bookmark, requiresAuth: true },
    { name: "Profile", path: "/profile", icon: User, requiresAuth: true },
  ];

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleSuccessfulPost = () => {
    console.log("Post created successfully");
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Craftly Logo"
                className="h-10 w-10 border-2 border-gray-800 rounded-full"
              />
              <span className="text-xl font-bold text-custom-sage hidden md:inline">
                Craftly
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {routes.map(
                (route) =>
                  (!route.requiresAuth ||
                    (route.requiresAuth && isLoaded && user)) && (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                        isActive(route.path)
                          ? "text-custom-sage bg-custom-mint/10"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <route.icon size={18} />
                      <span>{route.name}</span>
                    </Link>
                  )
              )}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <SignedIn>
              {/* Create Post Button (Desktop) */}
              <Button
                onClick={() => setShowPostModal(true)}
                className="hidden md:flex items-center gap-2 bg-custom-mint hover:bg-custom-sage"
              >
                <PlusSquare size={18} />
                <span>Create</span>
              </Button>

              {/* User Button */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              >
                {/* <div
                  onClick={handleClickProfile}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <User2 size={18} />
                  <span>Profile</span>
                </div> */}
              </UserButton>
            </SignedIn>

            <SignedOut>
              <div className="hidden md:flex gap-2">
                <SignInButton>
                  <Button variant="outline">Log In</Button>
                </SignInButton>
                <SignUpButton>
                  <ShimmerButton>
                    <span className="font-medium">Sign Up</span>
                  </ShimmerButton>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-white">
          <div className="container pt-20 pb-6 px-4">
            {/* Mobile Search */}
            <div className="mb-6">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-custom-mint"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-1">
              {routes.map(
                (route) =>
                  (!route.requiresAuth ||
                    (route.requiresAuth && isLoaded && user)) && (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`px-4 py-3 text-base font-medium rounded-md flex items-center gap-3 ${
                        isActive(route.path)
                          ? "text-custom-sage bg-custom-mint/10"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <route.icon size={20} />
                      <span>{route.name}</span>
                    </Link>
                  )
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Post Creation Modal */}
      <PostEditor
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSuccess={handleSuccessfulPost}
      />
    </>
  );
}
