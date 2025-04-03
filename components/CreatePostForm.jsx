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
import {
  Trash2,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { DraftSchema, DraftConverter } from "@/models/Drafts";

export default function CreatePostForm({ onPostCreated }) {
  const { user } = useUser();
  const [imageFiles, setImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState("");

  const handleImageUpload = (e) => {
    console.log("handleImageUpload called");
    const files = Array.from(e.target.files);
    console.log("Selected files:", files);
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageFiles((prev) => [...prev, ...files]);
  };

  const uploadImages = async () => {
    console.log("uploadImages called with files:", imageFiles);
    const uploadPromises = imageFiles.map(async (file, index) => {
      console.log(
        `Uploading file ${index + 1}/${imageFiles.length}:`,
        file.name
      );
      // Create a unique path for the image
      const storagePath = `posts/${user.id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Update progress
      setUploadProgress((prev) => prev + 100 / imageFiles.length);

      // Get download URL
      const url = await getDownloadURL(storageRef);
      console.log(`File ${index + 1} uploaded successfully:`, url);
      return url;
    });

    const urls = await Promise.all(uploadPromises);
    console.log("All files uploaded successfully:", urls);
    return urls;
  };

  const updateUserPosts = async (userId, postId) => {
    try {
      console.log("Updating user posts for user:", userId);
      // Get user document reference
      const userDocRef = doc(db, "users", userId).withConverter(UserConverter);

      // Get current user data
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        console.error("User document not found:", userId);
        throw new Error("User document not found");
      }

      // Update existing user
      const userData = userSnapshot.data();
      userData.addPost(postId);
      await updateDoc(userDocRef, UserConverter.toFirestore(userData));
      console.log("User posts updated successfully");
    } catch (error) {
      console.error("Error updating user posts:", error);
      throw error;
    }
  };

  const handleRemoveImage = (id) => {
    setImageFiles((prev) => {
      const imageToRemove = prev.find((file, index) => index === id);
      if (imageToRemove) {
        URL.revokeObjectURL(URL.createObjectURL(imageToRemove));
      }
      return prev.filter((_, index) => index !== id);
    });
  };

  const createPost = async () => {
    console.log("createPost function called");
    console.log("Current state:", {
      imageFiles: imageFiles.length,
      description: description.trim(),
      isUploading,
    });

    if (imageFiles.length === 0 || !description.trim()) {
      toast.error("Please add at least one image and a description");
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 1. Upload images to Firebase storage
      console.log("Starting image upload...");
      const uploadedImageURLs = await uploadImages();
      console.log("Images uploaded successfully:", uploadedImageURLs);

      // 2. Create a new post object
      const newPost = new PostSchema(
        "",
        description,
        uploadedImageURLs,
        uploadedImageURLs.length > 1,
        user.id,
        0,
        [],
        false
      );
      console.log("New post object created:", newPost);

      // 3. Add post to Firestore
      console.log("Adding post to Firestore...");
      const newPostId = await addData("posts", newPost, PostConverter);
      console.log("Post added to Firestore with ID:", newPostId);

      await updateUserPosts(user.id, newPostId);

      // 4. Reset form
      setImageFiles([]);
      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 5. Call the callback function to notify parent
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const saveAsDraft = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload images if any
      let uploadedImageURLs = [];
      if (imageFiles.length > 0) {
        uploadedImageURLs = await uploadImages();
      }

      // Create a new draft object
      const newDraft = new DraftSchema(
        "",
        description,
        uploadedImageURLs,
        uploadedImageURLs.length > 1,
        user.id
      );

      // Add draft to Firestore
      const newDraftId = await addData("drafts", newDraft, DraftConverter);
      console.log("Draft saved with ID:", newDraftId);

      toast.success("Draft saved successfully!");
      onPostCreated(null);
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(`Failed to save draft: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = async () => {
    if (description.trim() || imageFiles.length > 0) {
      const shouldSave = window.confirm(
        "Would you like to save this as a draft?"
      );
      if (shouldSave) {
        await saveAsDraft();
      }
    }
    onPostCreated(null);
  };

  const handleSubmit = (e) => {
    console.log("Form submitted");
    e.preventDefault();
    createPost();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <img
          src={user.imageUrl}
          alt={`${user.username || user.firstName}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            <span>Add Images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              ref={fileInputRef}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {imageFiles.length} image{imageFiles.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
        </div>

        {imageFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isUploading}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Uploading images...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !description.trim() || imageFiles.length === 0 || isUploading
          }
        >
          {isUploading ? "Creating Post..." : "Post"}
        </button>
      </div>
    </form>
  );
}
