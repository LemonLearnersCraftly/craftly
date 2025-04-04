// utils/postService.ts
import { db, storage } from "./firebaseConfig";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { PostSchema, PostConverter } from "../models/Posts";
import { DraftSchema, DraftConverter } from "../models/Drafts";
import { UserData } from "../models/Users";

// Types
export interface ImageFile {
  file: File;
  localUrl?: string;
}

export interface PostData {
  id?: string;
  description: string;
  images: string[];
  hasCarousel?: boolean;
  tags?: string[];
  craftType?: string;
  assciateUser: string;
  likes?: number;
  comments?: any[];
  saved?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Comment {
  id?: string;
  userId: string;
  username: string;
  profileImage?: string;
  text: string;
  createdAt?: any;
  likes?: number;
}

class PostService {
  // Create a new post
  async createPost(
    postData: PostData,
    imageFiles: ImageFile[],
    isDraft: boolean = false
  ): Promise<string> {
    try {
      // 1. Upload images to Firebase Storage
      const imageUrls = await this.uploadImages(
        imageFiles,
        postData.assciateUser
      );

      // 2. Create post or draft document
      const collectionName = isDraft ? "drafts" : "posts";
      const postSchema = isDraft
        ? new DraftSchema(
            "",
            postData.description,
            imageUrls,
            imageUrls.length > 1,
            postData.assciateUser,
            new Date(),
            new Date()
          )
        : new PostSchema(
            "",
            imageUrls,
            imageUrls.length > 1,
            postData.assciateUser,
            0,
            [],
            false
          );

      // Add additional fields
      const dataToSave: any = {
        ...postSchema.toJSON(),
        tags: postData.tags || [],
        craftType: postData.craftType || "General",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to Firestore
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, dataToSave);

      // Update with ID
      await updateDoc(doc(db, collectionName, docRef.id), {
        id: docRef.id,
      });

      console.log(
        `${isDraft ? "Draft" : "Post"} created with ID: ${docRef.id}`
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  // Update existing post
  async updatePost(
    postId: string,
    postData: PostData,
    newImageFiles: ImageFile[],
    isDraft: boolean = false
  ): Promise<void> {
    try {
      const collectionName = isDraft ? "drafts" : "posts";
      const docRef = doc(db, collectionName, postId);

      // Get existing post data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`${isDraft ? "Draft" : "Post"} not found`);
      }

      const existingData = docSnap.data();
      const existingImages = existingData.images || [];

      // Upload new images
      const newImageUrls = await this.uploadImages(
        newImageFiles,
        postData.assciateUser
      );

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update document
      const updateData: any = {
        description: postData.description,
        images: allImages,
        hasCarousel: allImages.length > 1,
        tags: postData.tags || existingData.tags || [],
        craftType: postData.craftType || existingData.craftType || "General",
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);
      console.log(`${isDraft ? "Draft" : "Post"} updated successfully`);
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  // Delete a post or draft
  async deletePost(postId: string, isDraft: boolean = false): Promise<void> {
    try {
      const collectionName = isDraft ? "drafts" : "posts";
      const docRef = doc(db, collectionName, postId);

      // Get post data to delete images
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`${isDraft ? "Draft" : "Post"} not found`);
      }

      const postData = docSnap.data();

      // Delete images from Storage
      if (postData.images && postData.images.length > 0) {
        const deletePromises = postData.images.map(async (imageUrl: string) => {
          try {
            // Get the path from the URL
            const path = this.getStoragePathFromUrl(imageUrl);
            if (path) {
              const imageRef = ref(storage, path);
              await deleteObject(imageRef);
            }
          } catch (err) {
            console.warn("Error deleting image:", err);
            // Continue even if some images fail to delete
          }
        });

        await Promise.all(deletePromises);
      }

      // Delete document
      await deleteDoc(docRef);
      console.log(`${isDraft ? "Draft" : "Post"} deleted successfully`);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  // Convert a draft to post
  async convertDraftToPost(draftId: string): Promise<string> {
    try {
      // Get draft data
      const draftRef = doc(db, "drafts", draftId);
      const draftSnap = await getDoc(draftRef);

      if (!draftSnap.exists()) {
        throw new Error("Draft not found");
      }

      const draftData = draftSnap.data();

      // Create new post
      const postSchema = new PostSchema(
        "",
        draftData.images || [],
        (draftData.images || []).length > 1,
        draftData.associateUser,
        0,
        [],
        false
      );

      // Add additional fields
      const dataToSave: any = {
        ...postSchema.toJSON(),
        description: draftData.description,
        tags: draftData.tags || [],
        craftType: draftData.craftType || "General",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to Firestore
      const postsRef = collection(db, "posts");
      const postRef = await addDoc(postsRef, dataToSave);

      // Update with ID
      await updateDoc(doc(db, "posts", postRef.id), {
        id: postRef.id,
      });

      // Delete the draft
      await deleteDoc(draftRef);

      console.log(`Draft converted to post with ID: ${postRef.id}`);
      return postRef.id;
    } catch (error) {
      console.error("Error converting draft to post:", error);
      throw error;
    }
  }

  // Like a post
  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, "posts", postId);

      // Increment like count
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });

      console.log("Post liked successfully");
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  }

  // Unlike a post
  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, "posts", postId);

      // Get current data
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }

      const postData = postSnap.data();
      const likedBy = postData.likedBy || [];

      // Remove user from likedBy array
      const updatedLikedBy = likedBy.filter((id: string) => id !== userId);

      // Update document
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: updatedLikedBy,
      });

      console.log("Post unliked successfully");
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  }

  // Add comment to post
  async addComment(postId: string, comment: Comment): Promise<string> {
    try {
      const postRef = doc(db, "posts", postId);

      // Generate a unique ID for the comment
      const commentId = `comment_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Prepare comment data
      const commentData = {
        ...comment,
        id: commentId,
        createdAt: serverTimestamp(),
        likes: 0,
      };

      // Update post with new comment
      await updateDoc(postRef, {
        comments: arrayUnion(commentData),
      });

      console.log("Comment added successfully");
      return commentId;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  // Delete comment from post
  async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      const postRef = doc(db, "posts", postId);

      // Get current comments
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }

      const postData = postSnap.data();
      const comments = postData.comments || [];

      // Remove comment
      const updatedComments = comments.filter(
        (comment: any) => comment.id !== commentId
      );

      // Update document
      await updateDoc(postRef, {
        comments: updatedComments,
      });

      console.log("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  // Save/bookmark a post
  async savePost(postId: string, userId: string): Promise<void> {
    try {
      // Update user's saved posts
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        savedPosts: arrayUnion(postId),
      });

      console.log("Post saved successfully");
    } catch (error) {
      console.error("Error saving post:", error);
      throw error;
    }
  }

  // Unsave/unbookmark a post
  async unsavePost(postId: string, userId: string): Promise<void> {
    try {
      // Get user's current saved posts
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const userData = userSnap.data();
      const savedPosts = userData.savedPosts || [];

      // Remove post from saved posts
      const updatedSavedPosts = savedPosts.filter(
        (id: string) => id !== postId
      );

      // Update user document
      await updateDoc(userRef, {
        savedPosts: updatedSavedPosts,
      });

      console.log("Post unsaved successfully");
    } catch (error) {
      console.error("Error unsaving post:", error);
      throw error;
    }
  }

  // Get posts for feed (with pagination)
  async getFeedPosts(
    userId: string,
    lastVisible: any = null,
    pageSize: number = 10
  ): Promise<{ posts: any[]; lastVisible: any }> {
    try {
      // Get user's interests for personalized feed
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let userInterests: string[] = [];
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userInterests = userData.interests?.items || [];
      }

      // Build query
      let postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );

      // Add pagination if we have a last visible document
      if (lastVisible) {
        postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          where("createdAt", "<", lastVisible.createdAt),
          limit(pageSize)
        );
      }

      // Execute query
      const querySnapshot = await getDocs(postsQuery);

      // Process results
      const posts: any[] = [];
      let newLastVisible = null;

      if (!querySnapshot.empty) {
        newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Get user data for each post
        for (const docu of querySnapshot.docs) {
          const postData = docu.data();

          try {
            // Get user info for the post
            const userDocRef = doc(db, "users", postData.assciateUser);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
              const userData: UserData = userSnapshot.data() as UserData;

              // Add user info to post
              posts.push({
                ...postData,
                username: userData.username,
                userImage: userData.imageUrl || "/profile-placeholder.jpg",
              });
            } else {
              // If user not found, still add the post with default values
              posts.push({
                ...postData,
                username: "Unknown Crafter",
                userImage: "/profile-placeholder.jpg",
              });
            }
          } catch (error) {
            console.error("Error fetching user for post:", error);
            // Add post even if user fetch fails
            posts.push({
              ...postData,
              username: "Crafter",
              userImage: "/profile-placeholder.jpg",
            });
          }
        }
      }

      return { posts, lastVisible: newLastVisible };
    } catch (error) {
      console.error("Error getting feed posts:", error);
      throw error;
    }
  }

  // Get user's posts
  async getUserPosts(
    userId: string,
    isDrafts: boolean = false
  ): Promise<any[]> {
    try {
      const collectionName = isDrafts ? "drafts" : "posts";
      const field = isDrafts ? "associateUser" : "assciateUser";

      const postsQuery = query(
        collection(db, collectionName),
        where(field, "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(postsQuery);

      const posts: any[] = [];

      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return posts;
    } catch (error) {
      console.error(`Error getting ${isDrafts ? "drafts" : "posts"}:`, error);
      throw error;
    }
  }

  // Get user's saved posts
  async getSavedPosts(userId: string): Promise<any[]> {
    try {
      // Get user's saved post IDs
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return [];
      }

      const userData = userSnap.data();
      const savedPostIds = userData.savedPosts || [];

      if (savedPostIds.length === 0) {
        return [];
      }

      // Get the actual posts
      const savedPosts: any[] = [];

      for (const postId of savedPostIds) {
        try {
          const postRef = doc(db, "posts", postId);
          const postSnap = await getDoc(postRef);

          if (postSnap.exists()) {
            const postData = postSnap.data();

            // Get user info for the post
            const userDocRef = doc(db, "users", postData.assciateUser);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
              const postUserData = userSnapshot.data();

              savedPosts.push({
                ...postData,
                username: postUserData.username,
                userImage: postUserData.imageUrl || "/profile-placeholder.jpg",
              });
            } else {
              savedPosts.push({
                ...postData,
                username: "Unknown Crafter",
                userImage: "/profile-placeholder.jpg",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching saved post:", error);
          // Continue even if one post fails
        }
      }

      return savedPosts;
    } catch (error) {
      console.error("Error getting saved posts:", error);
      throw error;
    }
  }

  // Helper methods
  private async uploadImages(
    imageFiles: ImageFile[],
    userId: string
  ): Promise<string[]> {
    if (!imageFiles || imageFiles.length === 0) {
      return [];
    }

    const uploadPromises = imageFiles.map(async (imageFile) => {
      const fileExtension = imageFile.file.name.split(".").pop();
      const fileName = `posts/${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, imageFile.file);
      return getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
  }

  private getStoragePathFromUrl(url: string): string | null {
    try {
      // Extract the path from the URL
      // This is a simplified approach - in reality, you may need to adjust this based on your Firebase config
      const pathMatch = url.match(/o\/(.+?)\?/);
      if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]);
      }
      return null;
    } catch (error) {
      console.error("Error extracting path from URL:", error);
      return null;
    }
  }
}

export const postService = new PostService();
export default postService;
