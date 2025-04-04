import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { storage } from "@/utils/firebaseConfig";
import db, { addData } from "@/utils/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { PostSchema, PostConverter } from "@/models/Posts";
import { UserSchema, UserConverter } from "@/models/Users";
import { DraftSchema, DraftConverter } from "@/models/Drafts";
import {
  Trash2,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Tag as TagIcon,
  Save,
  ChevronDown,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { toast } from "sonner";

export default function PostEditor({
  isOpen = true,
  onClose,
  existingPost = null,
  isDraft = false,
  onSuccess,
  isModal = false,
}) {
  const { user } = useUser();
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [craftType, setCraftType] = useState("General");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const craftOptions = [
    "General",
    "Knitting",
    "Crochet",
    "Sewing",
    "Embroidery",
    "Quilting",
    "Paper Crafts",
    "Jewelry Making",
    "Pottery",
    "Woodworking",
    "Other",
  ];

  // Load existing post data if editing
  useEffect(() => {
    if (existingPost) {
      setDescription(existingPost.description || "");

      if (existingPost.images && existingPost.images.length > 0) {
        setImageURLs(existingPost.images);
      }

      if (existingPost.tags) {
        setTags(existingPost.tags);
      }

      if (existingPost.craftType) {
        setCraftType(existingPost.craftType);
      }
    } else {
      // Reset form if not editing
      resetForm();
    }
  }, [existingPost, isOpen]);

  const resetForm = () => {
    setDescription("");
    setImageFiles([]);
    setImageURLs([]);
    setTags([]);
    setCraftType("General");
    setError("");
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imageFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [imageFiles]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const newImageFiles = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImageFiles((prev) => [...prev, ...newImageFiles]);

    // Add local preview URLs to imageURLs for UI display
    const newUrls = newImageFiles.map((img) => img.preview);
    setImageURLs((prev) => [...prev, ...newUrls]);
  };

  const handleRemoveImage = (index) => {
    // Remove from imageFiles
    setImageFiles((prev) => {
      const newFiles = [...prev];
      const fileToRemove = newFiles[index];

      // If it's a local preview, revoke the object URL
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      newFiles.splice(index, 1);
      return newFiles;
    });

    // Remove from imageURLs
    setImageURLs((prev) => {
      const newURLs = [...prev];
      newURLs.splice(index, 1);
      return newURLs;
    });
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Handle tag input keyboard event
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = imageFiles
        .filter((file) => file.file) // Only process files that haven't been uploaded yet
        .map(async (fileObj, index) => {
          // Create a unique path for the image
          const storagePath = `posts/${user.id}/${Date.now()}-${
            fileObj.file.name
          }`;
          const storageRef = ref(storage, storagePath);

          // Upload the file
          await uploadBytes(storageRef, fileObj.file);

          // Update progress
          setUploadProgress((prev) => {
            const newProgress =
              prev + 100 / imageFiles.filter((f) => f.file).length;
            return Math.min(newProgress, 100); // Ensure it never exceeds 100
          });

          // Get download URL
          const url = await getDownloadURL(storageRef);
          return url;
        });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Combine existing remote URLs with newly uploaded ones
      const existingRemoteUrls = imageURLs.filter(
        (url) =>
          !url.startsWith("blob:") &&
          !imageFiles.some((file) => file.preview === url)
      );

      return [...existingRemoteUrls, ...uploadedUrls];
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(`Failed to upload images: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const updateUserPosts = async (userId, postId) => {
    try {
      // Get user document reference
      const userDocRef = doc(db, "users", userId).withConverter(UserConverter);

      // Get current user data
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        throw new Error("User document not found");
      }

      // Update existing user
      const userData = userSnapshot.data();
      userData.addPost(postId);
      await updateDoc(userDocRef, UserConverter.toFirestore(userData));
    } catch (error) {
      console.error("Error updating user posts:", error);
      throw error;
    }
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    if (e) e.preventDefault();

    try {
      setError("");

      // Basic validation
      if (!user) {
        setError("You must be logged in to create a post");
        return;
      }

      if (imageFiles.length === 0 && imageURLs.length === 0) {
        setError("Please add at least one image");
        return;
      }

      if (!description.trim() && !saveAsDraft) {
        setError("Please add a description");
        return;
      }

      setIsUploading(true);

      // Upload images to Firebase storage
      const uploadedImageURLs = await uploadImages();

      // If editing an existing post or draft
      if (existingPost) {
        if (isDraft && !saveAsDraft) {
          // Converting draft to post
          await convertDraftToPost(existingPost.id, {
            description,
            images: uploadedImageURLs,
            tags,
            craftType,
          });

          toast.success("Your draft has been published as a post!");
        } else {
          // Updating existing post or draft
          const collectionName = isDraft || saveAsDraft ? "drafts" : "posts";
          const Converter =
            isDraft || saveAsDraft ? DraftConverter : PostConverter;

          const docRef = doc(db, collectionName, existingPost.id).withConverter(
            Converter
          );
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new Error(`${isDraft ? "Draft" : "Post"} not found`);
          }

          const updatedData = docSnap.data();
          updatedData.description = description;
          updatedData.images = uploadedImageURLs;
          updatedData.tags = tags;
          updatedData.craftType = craftType;

          await updateDoc(docRef, Converter.toFirestore(updatedData));

          toast.success(
            `Your ${
              isDraft || saveAsDraft ? "draft" : "post"
            } has been updated!`
          );
        }
      } else {
        // Creating a new post or draft
        if (saveAsDraft) {
          // Create a new draft
          const newDraft = new DraftSchema(
            "",
            description,
            uploadedImageURLs,
            uploadedImageURLs.length > 1,
            user.id,
            tags,
            craftType
          );

          const newDraftId = await addData("drafts", newDraft, DraftConverter);

          toast.success("Draft saved successfully!");

          if (onSuccess) {
            onSuccess(newDraftId, true);
          }
        } else {
          // Create a new post
          const newPost = new PostSchema(
            "",
            description,
            uploadedImageURLs,
            uploadedImageURLs.length > 1,
            user.id,
            0,
            [],
            false,
            tags,
            craftType
          );

          const newPostId = await addData("posts", newPost, PostConverter);

          // Update user's posts
          await updateUserPosts(user.id, newPostId);

          toast.success("Post created successfully!");

          if (onSuccess) {
            onSuccess(newPostId, false);
          }
        }
      }

      // Reset form
      resetForm();

      // Close modal if it's in modal mode
      if (isModal && onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed: ${error.message}`);
      setError(`Failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const convertDraftToPost = async (draftId, draftData) => {
    try {
      // Get the draft
      const draftRef = doc(db, "drafts", draftId).withConverter(DraftConverter);
      const draftSnap = await getDoc(draftRef);

      if (!draftSnap.exists()) {
        throw new Error("Draft not found");
      }

      // Create a new post from the draft
      const newPost = new PostSchema(
        "",
        draftData.description || draftSnap.data().description,
        draftData.images || draftSnap.data().images,
        (draftData.images || draftSnap.data().images).length > 1,
        user.id,
        0,
        [],
        false,
        draftData.tags || draftSnap.data().tags || [],
        draftData.craftType || draftSnap.data().craftType || "General"
      );

      // Add the post to Firestore
      const newPostId = await addData("posts", newPost, PostConverter);

      // Update user's posts
      await updateUserPosts(user.id, newPostId);

      // Delete the draft
      await deleteDoc(doc(db, "drafts", draftId));

      return newPostId;
    } catch (error) {
      console.error("Error converting draft to post:", error);
      throw error;
    }
  };

  const handleCancel = async () => {
    if (description.trim() || imageFiles.length > 0) {
      const shouldSave = window.confirm(
        "Would you like to save this as a draft?"
      );
      if (shouldSave) {
        await handleSubmit(null, true);
      }
    }

    resetForm();

    if (onClose) {
      onClose();
    }
  };

  // If this is a modal and it's not open, don't render anything
  if (isModal && !isOpen) return null;

  // Modal wrapper when in modal mode
  const ModalWrapper = ({ children }) => {
    if (!isModal) return children;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-custom-sage">
              {existingPost
                ? isDraft
                  ? "Edit Draft"
                  : "Edit Post"
                : "Create New Post"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <ModalWrapper>
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* User Avatar - only show in non-modal view */}
        {!isModal && (
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl}
              alt={`${user.username || user.firstName}'s avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Photos
          </label>

          {/* Image Previews */}
          {imageURLs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {imageURLs.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border group"
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
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

          {/* Upload Button */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center">
              <ImageIcon className="text-gray-400 w-12 h-12 mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop photos here</p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button variant="outline" type="button">
                Browse Files
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              <p className="text-gray-400 text-xs mt-4">
                Add up to 10 photos. First image will be the cover.
              </p>
            </div>
          </div>
        </div>

        {/* Craft Type */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Craft Type
          </label>
          <select
            value={craftType}
            onChange={(e) => setCraftType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isUploading}
          >
            {craftOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share details about your craft project..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            rows={5}
            disabled={isUploading}
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Tags
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <TagIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Add tags separated by Enter or comma"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isUploading}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || isUploading}
            >
              Add
            </Button>
          </div>

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-500 hover:text-red-500"
                    disabled={isUploading}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Uploading images...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {existingPost && isDraft ? (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, false)}
                disabled={
                  isUploading || imageURLs.length === 0 || !description.trim()
                }
                className="flex items-center gap-2"
              >
                <Save size={16} />
                <span>Publish Draft</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isUploading || imageURLs.length === 0}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                <span>Save as Draft</span>
              </Button>
            )}

            {/* Use ShimmerButton if available, otherwise fall back to regular Button */}
            {typeof ShimmerButton !== "undefined" ? (
              <ShimmerButton
                type="submit"
                disabled={
                  isUploading ||
                  imageURLs.length === 0 ||
                  (!existingPost && !description.trim())
                }
                className="w-40"
              >
                <span className="font-medium">
                  {isUploading
                    ? "Saving..."
                    : existingPost && !isDraft
                    ? "Update Post"
                    : "Publish Post"}
                </span>
              </ShimmerButton>
            ) : (
              <Button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-40"
                disabled={
                  isUploading ||
                  imageURLs.length === 0 ||
                  (!existingPost && !description.trim())
                }
              >
                {isUploading
                  ? "Saving..."
                  : existingPost && !isDraft
                  ? "Update Post"
                  : "Publish Post"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
