// services/postService.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  limit,
  orderBy,
  startAfter,
  addDoc,
  increment,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/utils/firestore";
import { PostSchema, PostConverter } from "@/models/Posts";
import { CommentSchema, CommentConverter } from "@/models/Comments";
import { LikeSchema, LikeConverter } from "@/models/Likes";
import { SavedPostSchema, SavedPostConverter } from "@/models/SavedPosts";

export const postService = {
  /**
   * Create a new post
   * @param {PostSchema} postData - The post data
   * @param {Array<File>} imageFiles - Array of image files to upload
   * @returns {Promise<string>} - The ID of the created post
   */
  async createPost(postData, imageFiles = []) {
    try {
      // Upload images if provided
      if (imageFiles.length > 0) {
        const imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const storagePath = `posts/${postData.assciateUser}/${Date.now()}-${
              file.name
            }`;
            const storageRef = ref(storage, storagePath);

            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );

        postData.images = imageUrls;
        postData.hasCarousel = imageUrls.length > 1;
      }

      // Set timestamps
      postData.createdAt = serverTimestamp();
      postData.updatedAt = serverTimestamp();

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, "posts"),
        PostConverter.toFirestore(postData)
      );

      // Update with the generated ID
      postData.id = docRef.id;
      await updateDoc(docRef, { id: docRef.id });

      // Update user's posts collection
      if (postData.assciateUser) {
        const userRef = doc(db, "users", postData.assciateUser);
        await updateDoc(userRef, {
          "posts.total": increment(1),
          "posts.items": arrayUnion({
            id: posts.items.length + 1,
            postRef: docRef.id,
            postedAt: serverTimestamp(),
          }),
        });
      }

      return docRef.id;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  /**
   * Get a post by ID
   * @param {string} postId - The post ID
   * @returns {Promise<PostSchema|null>} - The post object or null if not found
   */
  async getPostById(postId) {
    try {
      const postDocRef = doc(db, "posts", postId).withConverter(PostConverter);
      const postDoc = await getDoc(postDocRef);

      if (postDoc.exists()) {
        return postDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting post:", error);
      throw error;
    }
  },

  /**
   * Update a post
   * @param {string} postId - The post ID
   * @param {Object} updates - The fields to update
   * @returns {Promise<void>}
   */
  async updatePost(postId, updates) {
    try {
      const postDocRef = doc(db, "posts", postId).withConverter(PostConverter);

      // Set update timestamp
      updates.updatedAt = serverTimestamp();

      await updateDoc(postDocRef, updates);
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  /**
   * Delete a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID (for validation)
   * @returns {Promise<void>}
   */
  async deletePost(postId, userId) {
    try {
      const postDocRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postDocRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const postData = postDoc.data();

      // Check that the user owns this post
      if (postData.assciateUser !== userId) {
        throw new Error("Unauthorized to delete this post");
      }

      // Delete images from storage
      if (postData.images && postData.images.length > 0) {
        await Promise.all(
          postData.images.map(async (imageUrl) => {
            // Extract storage path from the URL
            const imagePath = decodeURIComponent(
              imageUrl.split("/o/")[1].split("?")[0]
            );
            const imageRef = ref(storage, imagePath);
            try {
              await deleteObject(imageRef);
            } catch (error) {
              console.error("Error deleting image:", error);
              // Continue deletion process even if image deletion fails
            }
          })
        );
      }

      // Delete associated data (likes, comments, saves)
      const likesQuery = query(
        collection(db, "likes"),
        where("postId", "==", postId)
      );
      const likesSnapshot = await getDocs(likesQuery);

      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);

      const savesQuery = query(
        collection(db, "savedPosts"),
        where("postId", "==", postId)
      );
      const savesSnapshot = await getDocs(savesQuery);

      // Batch delete all associated documents
      const deletePromises = [];

      likesSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      commentsSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      savesSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      await Promise.all(deletePromises);

      // Finally delete the post
      await deleteDoc(postDocRef);

      // Update user's posts collection
      if (postData.assciateUser) {
        const userDocRef = doc(db, "users", postData.assciateUser);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.posts && userData.posts.items) {
            // Filter out the deleted post
            const updatedItems = userData.posts.items.filter(
              (item) => item.postRef !== postId
            );

            await updateDoc(userDocRef, {
              "posts.total": updatedItems.length,
              "posts.items": updatedItems,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  /**
   * Get posts for the feed
   * @param {Object} options - Query options
   * @param {string} options.feedType - Type of feed ('forYou', 'following', 'trending')
   * @param {Array<string>} options.userFollowing - IDs of users the current user follows
   * @param {Array<string>} options.categories - Categories to filter by
   * @param {number} options.limit - Maximum number of posts to fetch
   * @param {DocumentSnapshot} options.lastVisible - Last document for pagination
   * @returns {Promise<Object>} - Posts and last visible document
   */
  async getFeedPosts(options = {}) {
    try {
      const {
        feedType = "forYou",
        userFollowing = [],
        categories = [],
        limit: postLimit = 10,
        lastVisible = null,
      } = options;

      let postsQuery;

      // Base query
      if (feedType === "following" && userFollowing.length > 0) {
        postsQuery = query(
          collection(db, "posts"),
          where("assciateUser", "in", userFollowing.slice(0, 10)), // Firestore has a limit of 10 values for 'in' queries
          orderBy("createdAt", "desc")
        );
      } else if (feedType === "trending") {
        postsQuery = query(
          collection(db, "posts"),
          orderBy("likes", "desc"),
          orderBy("createdAt", "desc")
        );
      } else {
        // For 'forYou' or default
        postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );
      }

      // Add pagination
      if (lastVisible) {
        postsQuery = query(postsQuery, startAfter(lastVisible));
      }

      // Add limit
      postsQuery = query(postsQuery, limit(postLimit));

      const postsSnapshot = await getDocs(postsQuery);

      // Process posts
      const posts = [];
      postsSnapshot.forEach((doc) => {
        const postData = doc.data();

        // Filter by categories if specified
        if (categories.length > 0) {
          if (
            !postData.categories ||
            !postData.categories.some((cat) => categories.includes(cat))
          ) {
            return; // Skip this post
          }
        }

        posts.push({
          id: doc.id,
          ...postData,
        });
      });

      // Get the last visible document for pagination
      const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];

      return {
        posts,
        lastVisible: lastVisibleDoc,
      };
    } catch (error) {
      console.error("Error getting feed posts:", error);
      throw error;
    }
  },

  /**
   * Like a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID
   * @returns {Promise<void>}
   */
  async likePost(postId, userId) {
    try {
      // Check if already liked
      const likesQuery = query(
        collection(db, "likes"),
        where("postId", "==", postId),
        where("userId", "==", userId)
      );

      const likesSnapshot = await getDocs(likesQuery);

      if (!likesSnapshot.empty) {
        return; // Already liked
      }

      // Create like document
      const likeData = new LikeSchema("", postId, userId);

      await addDoc(
        collection(db, "likes"),
        LikeConverter.toFirestore(likeData)
      );

      // Increment post likes counter
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { likes: increment(1) });
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  },

  /**
   * Unlike a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID
   * @returns {Promise<void>}
   */
  async unlikePost(postId, userId) {
    try {
      // Find the like document
      const likesQuery = query(
        collection(db, "likes"),
        where("postId", "==", postId),
        where("userId", "==", userId)
      );

      const likesSnapshot = await getDocs(likesQuery);

      if (likesSnapshot.empty) {
        return; // Not liked
      }

      // Delete like document
      await deleteDoc(likesSnapshot.docs[0].ref);

      // Decrement post likes counter
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { likes: increment(-1) });
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  },

  /**
   * Check if user has liked a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} - Whether the user has liked the post
   */
  async hasUserLikedPost(postId, userId) {
    try {
      const likesQuery = query(
        collection(db, "likes"),
        where("postId", "==", postId),
        where("userId", "==", userId)
      );

      const likesSnapshot = await getDocs(likesQuery);

      return !likesSnapshot.empty;
    } catch (error) {
      console.error("Error checking like status:", error);
      throw error;
    }
  },

  /**
   * Add a comment to a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID
   * @param {string} username - The username
   * @param {string} userImage - The user's profile image URL
   * @param {string} content - The comment content
   * @returns {Promise<string>} - The ID of the created comment
   */
  async addComment(postId, userId, username, userImage, content) {
    try {
      const commentData = new CommentSchema(
        "",
        postId,
        userId,
        username,
        userImage,
        content
      );

      // Add comment to Firestore
      const docRef = await addDoc(
        collection(db, "comments"),
        CommentConverter.toFirestore(commentData)
      );

      // Update with the generated ID
      commentData.id = docRef.id;
      await updateDoc(docRef, { id: docRef.id });

      return docRef.id;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  /**
   * Get comments for a post
   * @param {string} postId - The post ID
   * @returns {Promise<Array>} - Array of comments
   */
  async getComments(postId) {
    try {
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "desc")
      );

      const commentsSnapshot = await getDocs(commentsQuery);

      const comments = [];
      commentsSnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return comments;
    } catch (error) {
      console.error("Error getting comments:", error);
      throw error;
    }
  },

  /**
   * Delete a comment
   * @param {string} commentId - The comment ID
   * @param {string} userId - The user ID (for validation)
   * @returns {Promise<void>}
   */
  async deleteComment(commentId, userId) {
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) {
        throw new Error("Comment not found");
      }

      const commentData = commentDoc.data();

      // Check that the user owns this comment
      if (commentData.userId !== userId) {
        throw new Error("Unauthorized to delete this comment");
      }

      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  /**
   * Save a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID
   * @returns {Promise<void>}
   */
  async savePost(postId, userId) {
    try {
      // Check if already saved
      const savedQuery = query(
        collection(db, "savedPosts"),
        where("postId", "==", postId),
        where("userId", "==", userId)
      );

      const savedSnapshot = await getDocs(savedQuery);

      if (!savedSnapshot.empty) {
        return; // Already saved
      }

      // Create saved post document
      const savedData = new SavedPostSchema("", postId, userId);

      await addDoc(
        collection(db, "savedPosts"),
        SavedPostConverter.toFirestore(savedData)
      );

      // Update user's saved posts
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.savedPosts) {
          await updateDoc(userRef, {
            "savedPosts.total": increment(1),
            "savedPosts.items": arrayUnion({
              id: userData.savedPosts.items.length + 1,
              postRef: postId,
              savedAt: serverTimestamp(),
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error saving post:", error);
      throw error;
    }
  },

  /**
   * Unsave a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID
   * @returns {Promise<void>}
   */
  async unsavePost(postId, userId) {
    try {
      // Find the saved post document
      const savedQuery = query(
        collection(db, "savedPosts"),
        where("postId", "==", postId),
        where("userId", "==", userId)
      );

      const savedSnapshot = await getDocs(savedQuery);

      if (savedSnapshot.empty) {
        return; // Not saved
      }

      // Delete saved post document
      await deleteDoc(savedSnapshot.docs[0].ref);

      // Update user's saved posts
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.savedPosts && userData.savedPosts.items) {
          // Filter out the unsaved post
          const updatedItems = userData.savedPosts.items.filter(
            (item) => item.postRef !== postId
          );

          await updateDoc(userRef, {
            "savedPosts.total": updatedItems.length,
            "savedPosts.items": updatedItems,
          });
        }
      }
    } catch (error) {
      console.error("Error unsaving post:", error);
      throw error;
    }
  },

  /**
   * Check if user has saved a post
   * @param {string} postId - The post ID
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} - Whether the user has saved the post
   */
  async hasUserSavedPost(postId, userId) {
    try {
      const savedQuery = query(
        collection(db, "savedPosts"),
        where("postId", "==", postId),
        where("userId", "==", userId)
      );

      const savedSnapshot = await getDocs(savedQuery);

      return !savedSnapshot.empty;
    } catch (error) {
      console.error("Error checking save status:", error);
      throw error;
    }
  },

  /**
   * Get saved posts for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of saved posts
   */
  async getSavedPosts(userId) {
    try {
      const savedQuery = query(
        collection(db, "savedPosts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const savedSnapshot = await getDocs(savedQuery);

      // Get the post IDs
      const postIds = savedSnapshot.docs.map((doc) => doc.data().postId);

      // Get the actual posts
      const posts = [];

      // Firebase has a limit on "in" queries, so we need to batch if there are many IDs
      const batchSize = 10;

      for (let i = 0; i < postIds.length; i += batchSize) {
        const batch = postIds.slice(i, i + batchSize);

        if (batch.length === 0) continue;

        const postsQuery = query(
          collection(db, "posts"),
          where("id", "in", batch)
        );

        const postsSnapshot = await getDocs(postsQuery);

        postsSnapshot.forEach((doc) => {
          posts.push({
            id: doc.id,
            ...doc.data(),
          });
        });
      }

      return posts;
    } catch (error) {
      console.error("Error getting saved posts:", error);
      throw error;
    }
  },
};
