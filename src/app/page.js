"use client";

import AddItem from "../../components/AddItem";

// This file will render components for home page
// Work in auth folder for authentication: signin, register, signout
// Work in home folder (Debatable) to create a more specific layout

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      <AddItem />
    </div>
  );
}
