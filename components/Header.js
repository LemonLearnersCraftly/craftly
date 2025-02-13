import React from 'react';
import '../styles/Header.css'; 
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";


const Header = () => {
    return (
        <header className="header">
            <img src="/logo.jpg" className="logo" />
            <input type="text" placeholder="search..." className="search-bar" />
            <div className="user">
                <SignedOut>
                    {/* Show Sign In and Sign Up buttons when user is NOT signed in */}
                    <SignUpButton className="signUp-button">Sign Up</SignUpButton>
                    <SignInButton className="signIn-button">Sign In</SignInButton>
                </SignedOut>

                <SignedIn>
                    {/* Show User Button when signed in (opens profile & sign-out options) */}
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
            </div>
            <div className="profile">
                <button >
                    <img src="/profile.jpg"></img>
                </button>
            </div>
        </header>
    );
};

export default Header;