// "use client";
// import React, { useEffect } from "react";
// import {
//   ClerkProvider,
//   SignInButton,
//   SignUpButton,
//   SignedIn,
//   SignedOut,
//   UserButton,
//   useUser,
// } from "@clerk/nextjs";
// import "../../globals.css";

// import { ShimmerButton } from "@/components/magicui/shimmer-button";
// import { Button } from "@/components/ui/button";
// import "../../../../styles/Header.css";
// import Link from "next/link";
// import { db } from "@/utils/firestore";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { UserSchema, UserConverter } from "@/models/Users";

// // Component to handle user creation in Firestore
// function UserSync() {
//   const { user, isLoaded } = useUser();
//   console.log(user);
//   useEffect(() => {
//     const createUserInFirestore = async () => {
//       if (!isLoaded || !user) return;

//       try {
//         // Check if user already exists
//         const userDocRef = doc(db, "users", user.id).withConverter(
//           UserConverter
//         );
//         const userDoc = await getDoc(userDocRef);

//         if (!userDoc.exists()) {
//           // Create new user if they don't exist
//           const newUser = new UserSchema(
//             user.id,
//             user.imageUrl || "",
//             user.username || "",
//             user.primaryEmailAddress?.emailAddress || ""
//           );

//           await setDoc(userDocRef, UserConverter.toFirestore(newUser));
//           console.log("User created in Firestore:", user.id);
//         }
//       } catch (error) {
//         console.error("Error creating user in Firestore:", error);
//       }
//     };

//     createUserInFirestore();
//   }, [user, isLoaded]);

//   return null; // This component doesn't render anything
// }

// const CustomFeedLayout = ({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) => {
//   return (
//     <ClerkProvider>
//       <UserSync />
//       <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
//         <div className="container flex h-16 items-center justify-between">
//           <div className="flex items-center gap-2">
//             <img
//               src="./logo.png"
//               className="h-14 w-14 border-2 border-gray-800 rounded-full"
//             />
//             <span className="text-xl font-bold text-custom-sage">Craftly</span>
//             <input type="text" placeholder="search..." className="search-bar" />
//           </div>

//           <div className="flex gap-4">
//             <SignedOut>
//               <SignInButton fallbackRedirectUrl="/feed">
//                 <ShimmerButton className="shadow-2xl">
//                   <span className="whitespace-pre-wrap text-center text-sm font-black leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
//                     Log In
//                   </span>
//                 </ShimmerButton>
//               </SignInButton>
//               <SignUpButton signInFallbackRedirectUrl="/feed">
//                 <Button className="bg-custom-mint hover:bg-custom-sage text-white font-black">
//                   Sign Up
//                 </Button>
//               </SignUpButton>
//             </SignedOut>
//             <SignedIn>
//               <UserButton
//                 appearance={{
//                   elements: {
//                     avatarBox: "h-[3.75rem] w-[3.75rem]",
//                   },
//                 }}
//               />
//             </SignedIn>
//           </div>
//         </div>
//       </header>
//       {children}
//       <footer className="border-t bg-white">
//         <div className="container  md:px-6 py-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <img
//                 src="./logo.png"
//                 className="h-14 w-14 border-2 border-gray-800 rounded-full"
//               />
//               <span className="text-xl font-bold text-custom-sage">
//                 Craftly
//               </span>
//             </div>
//             <p className="text-sm text-gray-600">
//               © {new Date().getFullYear()} Craftly. All rights reserved.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </ClerkProvider>
//   );
// };

// export default CustomFeedLayout;
