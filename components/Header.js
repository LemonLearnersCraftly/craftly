import React from "react";
import { ShimmerButton } from "./magicui/shimmer-button";
import { Button } from "./ui/button";
import "../styles/Header.css";
import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="./logo.png"
            className="h-14 w-14 border-2 border-gray-800 rounded-full"
          />
          <span className="text-xl font-bold text-primary-500">Craftly</span>
        </div>

        <div className="flex gap-4">
          <ShimmerButton className="bg-surface-100 hover:bg-surface-200 text-foreground shadow-surface">
            <span className="whitespace-pre-wrap text-center text-sm font-black leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
              Log In
            </span>
          </ShimmerButton>
          <SignUpButton signInFallbackRedirectUrl="/feed">
            <Button className="bg-primary-500 hover:bg-primary-500 text-white font-black">
              Sign Up
            </Button>
          </SignUpButton>
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
  );
};

export default Header;
