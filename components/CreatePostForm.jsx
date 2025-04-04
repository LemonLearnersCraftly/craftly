// components/CreatePostForm.jsx
"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { storage } from "@/utils/firebaseConfig";
import { addData, db } from "@/utils/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { PostSchema, PostConverter } from "@/models/Posts";
import { UserSchema, UserConverter } from "@/models/Users";

export default function CreatePostForm({ onPostCreated }) {
  const { user } = useUser();
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      // Preview images
      const newImageFiles = [...imageFiles, ...files];
      setImageFiles(newImageFiles);

      // Create preview URLs
      const imageURLs = files.map((file) => URL.createObjectURL(file));
      setImages((prevImages) => [...prevImages, ...imageURLs]);
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if (imageFiles.length === 0) {
      alert("Please select at least one image for your post");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload images to Firebase Storage
      const uploadedImageURLs = await uploadImages(imageFiles);

      // 2. Create new post object
      const newPost = new PostSchema(
        "", // ID will be set after Firestore creates the document
        uploadedImageURLs,
        uploadedImageURLs.length > 1, // hasCarousel if multiple images
        user.id,
        0, // initial likes
        [], // initial comments
        false // initial saved status
      );

      // 3. Add post to Firestore
      const newPostId = await addData("posts", newPost, PostConverter);

      await updateUserPosts(user.id, newPostId);

      // 6. Reset form
      setImages([]);
      setImageFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 7. Callback if provided
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Error creating post: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadImages = async (files) => {
    const uploadPromises = files.map(async (file, index) => {
      // Create a unique path for the image
      const storagePath = `posts/${user.id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Update progress
      setUploadProgress((prev) => prev + 100 / files.length);

      // Get download URL
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  const updateUserPosts = async (userId, postId) => {
    try {
      // Get user document reference
      const userDocRef = doc(db, "users", userId).withConverter(UserConverter);

      // Get current user data
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        // Create new user if it doesn't exist
        const newUser = new UserSchema(
          userId,
          user.username || user.firstName,
          user.primaryEmailAddress.emailAddress
        );
        newUser.addPost(postId);
        await addDoc(
          collection(db, "users"),
          UserConverter.toFirestore(newUser)
        );
      } else {
        // Update existing user
        const userData = userSnapshot.data();
        userData.addPost(postId);
        await updateDoc(userDocRef, UserConverter.toFirestore(userData));
      }
    } catch (error) {
      console.error("Error updating user posts:", error);
      throw error;
    }
  };

  return (
    <div className="create-post-form">
      <h2>Create New Post</h2>

      <div className="image-upload-container">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          ref={fileInputRef}
          disabled={isUploading}
        />

        <div className="image-previews">
          {images.map((img, index) => (
            <div key={index} className="image-preview">
              <img src={img} alt={`Preview ${index}`} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={isUploading}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {isUploading && (
        <div className="upload-progress">
          <div
            className="progress-bar"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <span>{Math.round(uploadProgress)}%</span>
        </div>
      )}

      <button
        type="button"
        onClick={createPost}
        disabled={isUploading || imageFiles.length === 0}
      >
        {isUploading ? "Creating Post..." : "Create Post"}
      </button>
    </div>
  );
}
