import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, SignIn } from "@clerk/nextjs";
import './signin.css';  
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <header className="header">
        <img src="/logo.jpg" className="logo" />
        <input type="text" placeholder="search..." className="search-bar" />

        <div className="button-group">
          <SignedOut>
            {/* Show Sign In and Sign Up buttons when user is NOT signed in */}
            <div className="signUp-button">
              <SignUpButton>Sign Up</SignUpButton>
            </div>
            <div className="signIn-button">
              <SignInButton>Sign In</SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            {/* Show User Button when signed in (opens profile & sign-out options) */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <Link href="/" className="home-button">Home</Link>
          <div className="profile">
            <button>
              <img src="/profile.jpg" alt="Profile" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="min-h-screen flex flex-col">
        {/* Sign-In Section */}
        <div className="signIn">
          <SignIn />
        </div>
      </div>
    </>
  );
}