"use client";

import React, { useState, useEffect } from "react";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import {
  Search,
  Menu,
  X,
  Home,
  Users,
  Heart,
  Bookmark,
  Settings,
  PenTool,
  Scissors,
  Info,
  LogOut,
  Volleyball,
  LucideIcon,
  BookOpen,
  MessageCircle,
  Bell,
  Paintbrush,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CraftButton } from "@/components/ui/craft-button";
import { PatternBackground } from "@/components/ui/pattern-background";
import { YarnSpinner } from "@/components/ui/yarn-spinner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { StitchDivider } from "@/components/ui/stitch-divider";
import { cn } from "@/lib/utils";
import { db } from "@/utils/firestore";
import { doc, getDoc } from "firebase/firestore";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import { StringLiteral } from "typescript";

interface LogoProps {
  className?: string;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
}

// Logo component
const Logo: React.FC<LogoProps> = ({ className }) => (
  <div className={cn("flex items-center", className)}>
    <div className="relative overflow-hidden w-10 h-10 rounded-full border-2 border-craft-300 bg-white shadow-sm">
      <img src="/logo.png" alt="Craftly Logo" className="object-cover" />
    </div>
    <span className="ml-2 text-xl font-bold text-craft-700 dark:text-craft-300">
      Craftly
    </span>
  </div>
);

// Nav item component for sidebar and mobile menu
const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  href,
  active,
  onClick,
  badge,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active
          ? "bg-craft-100 text-craft-800 font-medium dark:bg-craft-800 dark:text-craft-100"
          : "text-gray-600 hover:bg-craft-50 hover:text-craft-700 dark:text-gray-300 dark:hover:bg-craft-800/50 dark:hover:text-craft-300"
      )}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </Link>
  );
};

// Navigation items configuration
const navItems = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: Scissors, label: "Explore", href: "/explore" },
  { icon: Users, label: "Following", href: "/following" },
  { icon: BookOpen, label: "Articles", href: "/articles" },
  { icon: Heart, label: "Liked", href: "/liked" },
  { icon: Bookmark, label: "Saved", href: "/saved" },
  { icon: PenTool, label: "Drafts", href: "/drafts" },
];

// Secondary nav for footer
const secondaryNavItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Info, label: "Help & Support", href: "/help" },
];

// UserSync component to sync Clerk user with Firestore
function UserSync() {
  const { user, isLoaded } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const createUserInFirestore = async () => {
      if (!isLoaded || !user) return;

      try {
        // Check if user already exists
        const userDocRef = doc(db, "users", user.id);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // If user doesn't exist, redirect to enhanced signup flow
          window.location.href = "/signup/enhanced";
        } else {
          // User exists, mark as initialized
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error checking user in Firestore:", error);
      }
    };

    if (isLoaded && user && !isInitialized) {
      createUserInFirestore();
    }
  }, [user, isLoaded, isInitialized]);

  return null; // This component doesn't render anything
}

interface CraftlyLayoutProps {
  children: React.ReactNode;
}

// Main layout component
const CraftlyLayout: React.FC<CraftlyLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  const [notifications, setNotifications] = useState(3); // Example notification count

  return (
    <ClerkProvider>
      <UserSync />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-craft-50 dark:from-gray-900 dark:to-gray-800">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="px-0">
                  <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                      <Logo />
                    </div>
                    <div className="px-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Main Navigation
                        </p>
                        {navItems.map((item) => (
                          <NavItem
                            key={item.href}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            active={pathname === item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                    <StitchDivider className="mx-3" />
                    <div className="px-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Other
                        </p>
                        {secondaryNavItems.map((item) => (
                          <NavItem
                            key={item.href}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            active={pathname === item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link href="/feed" className="hidden md:flex">
                <Logo />
              </Link>

              {/* Mobile Logo (centered) */}
              <div className="flex md:hidden mx-auto">
                <Logo />
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:flex w-full max-w-sm items-center">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="search"
                  placeholder="Search crafts, patterns..."
                  className="flex h-10 w-full rounded-full border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Mobile search button */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Example notifications */}
                  <div className="max-h-96 overflow-auto">
                    <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          <img
                            src="https://i.pravatar.cc/32?u=1"
                            alt="Avatar"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="font-semibold">Emma</span> liked
                            your post
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          <img
                            src="https://i.pravatar.cc/32?u=2"
                            alt="Avatar"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="font-semibold">Alex</span>{" "}
                            commented on your post
                          </p>
                          <p className="text-xs text-gray-500">8 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          <img
                            src="https://i.pravatar.cc/32?u=3"
                            alt="Avatar"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="font-semibold">Sarah</span> started
                            following you
                          </p>
                          <p className="text-xs text-gray-500">Yesterday</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button variant="outline" className="w-full" size="sm">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sign in/up or User Menu */}
              <SignedOut>
                <div className="flex gap-2">
                  <div className="hidden sm:block">
                    <SignInButton>
                      <Button variant="ghost">Log In</Button>
                    </SignInButton>
                  </div>
                  <SignUpButton>
                    <CraftButton variant="craft">Sign Up</CraftButton>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                  userProfileMode="navigation"
                  userProfileUrl="/profile"
                />
              </SignedIn>
            </div>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex-1 flex container max-w-screen-2xl mx-auto">
          {/* Sidebar (desktop only) */}
          <aside className="w-64 shrink-0 hidden md:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pb-10">
            <div className="py-6 pr-2">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={pathname === item.href}
                    badge={
                      item.href === "/notifications" ? notifications : null
                    }
                  />
                ))}
              </nav>

              <StitchDivider className="my-4" />

              <div className="px-3 py-4">
                <PatternBackground
                  pattern="paper"
                  color="craft"
                  className="p-4 rounded-lg flex items-center justify-center flex-col"
                >
                  <div className="text-center mb-3">
                    <h3 className="font-handwritten text-xl text-craft-800">
                      Craft of the Day
                    </h3>
                    <p className="text-sm text-craft-600">Try something new!</p>
                  </div>
                  <div className="relative rounded-lg overflow-hidden w-full aspect-video mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1669734580238-30c1492a7321?w=300&q=80"
                      alt="Craft of the day"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CraftButton variant="sage" size="sm" className="w-full">
                    <Paintbrush className="w-4 h-4 mr-1" />
                    Explore
                  </CraftButton>
                </PatternBackground>
              </div>

              <div className="mt-4">
                <nav className="space-y-1 px-3">
                  {secondaryNavItems.map((item) => (
                    <NavItem
                      key={item.href}
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={pathname === item.href}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 py-6 px-4 md:px-6">{children}</main>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-gray-900 dark:border-gray-800 z-40">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-2 rounded-md",
                  pathname === item.href
                    ? "text-primary"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
                {item.href === "/notifications" && notifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {notifications}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Loading spinner (only shown during page transitions and data loading) */}
        <div
          id="global-loader"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        >
          <YarnSpinner size="lg" color="mint" />
        </div>
      </div>
    </ClerkProvider>
  );
};

export default CraftlyLayout;
