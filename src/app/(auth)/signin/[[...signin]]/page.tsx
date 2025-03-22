import { SignIn } from '@clerk/nextjs';
import './signin.css';  
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 text-white flex justify-between">
        <h1 className="text-xl font-bold">MyApp</h1>
        <Link href="/" className="text-white hover:underline">Home</Link>
      </nav>

      {/* Sign-In Section */}
      <div className="flex flex-col justify-center items-center flex-grow">
        <SignIn forceRedirectUrl={'/feed'}/>
      </div>
    </div>
  );
}





