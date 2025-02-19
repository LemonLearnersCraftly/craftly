"use client";

import AddItem from "../../components/AddItem";
import Head from "next/head";
import { useRef, useState } from "react";
import { getFile, uploadFile } from "@/libs/storage";

// This file will render components for home page
// Work in auth folder for authentication: signin, register, signout
// Work in home folder (Debatable) to create a more specific layout

// export default function Home() {
//   return (
//     <div>
//       <h1>Welcome to My Next.js App</h1>
//       <AddItem />
//     </div>
//   );
// }

// dummy code for file uploads
export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null); // set state for file (name and handles form side of things)
  const [uploaded, setUploaded] = useState(null); // set link of file upload
  const inputRef = useRef(null); // use reference to input so that even after subsequent refreshes, the state of input remains the same.

  const handleUpload = async () => {
    const folder = "user/"; // here is that folder I mentioned in /src/libs/storage.js
    const imagePath = await uploadFile(selectedFile, folder); // upload that file
    const imageUrl = await getFile(imagePath); // get URL of file
    setUploaded(imageUrl); // set link to uploaded file (cloud)
  };

  return (
    <>
      <div className="container mx-auto mt-8 max-w-[560px]">
        <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-900 mb-4">
          <h1 className="text-3xl font-semibold">Upload File</h1>
        </div>
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => {
            setSelectedFile(e?.target?.files?.[0]);
          }}
        />
        <button
          className="mt-5 bg-green-600 hover:bg-opacity-80 text-white rounded-lg px-4 py-2 duration-200 w-full"
          type="button"
          onClick={handleUpload}
        >
          Upload File
        </button>

        {uploaded && <img src={uploaded} className="my-5 max-w-[400px]" />}
        {/* if the file has been uploaded, show it */}
      </div>
      <Head>
        <title>Upload File</title>
      </Head>
    </>
  );
}
