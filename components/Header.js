import React from "react";
import { ShimmerButton } from "./magicui/shimmer-button";
import { Button } from "./ui/button";
import "../styles/Header.css";
import { SignInButton, SignUpButton, SignOutButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="./logo.png"
            className="h-14 w-14 border-2 border-gray-800 rounded-full"
          />
          <span className="text-xl font-bold text-custom-sage">Craftly</span>
        </div>

        <div className="flex gap-4">
          <ShimmerButton className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-sm font-black leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
              Log In
            </span>
          </ShimmerButton>
          <Button className="bg-custom-mint hover:bg-custom-sage text-white font-black">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
