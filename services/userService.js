// services/userService.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { db } from "@/utils/firestore";
import { UserSchema, UserConverter } from "@/models/Users";

export const userService = {
  /**
   * Get a user by ID
   * @param {string} userId - The user ID
   * @returns {Promise<UserSchema|null>} - The user object or null if not found
   */
  async getUserById(userId) {
    try {
      const userDocRef = doc(db, "users", userId).withConverter(UserConverter);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {UserSchema} userData - The user data
   * @returns {Promise<string>} - The ID of the created user
   */
  async createUser(userData) {
    try {
      if (!userData.id) {
        throw new Error("User ID is required");
      }

      const userDocRef = doc(db, "users", userData.id).withConverter(
        UserConverter
      );

      // Check if user already exists
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        throw new Error("User already exists");
      }

      // Set creation timestamp if not already set
      if (!userData.createdAt) {
        userData.createdAt = serverTimestamp();
      }
      if (!userData.lastActive) {
        userData.lastActive = serverTimestamp();
      }

      await setDoc(userDocRef, userData);
      return userData.id;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update a user
   * @param {string} userId - The user ID
   * @param {Object} updates - The fields to update
   * @returns {Promise<void>}
   */
  async updateUser(userId, updates) {
    try {
      const userDocRef = doc(db, "users", userId).withConverter(UserConverter);

      // Check if user exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      // Set update timestamp
      updates.lastActive = serverTimestamp();

      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Update user interests
   * @param {string} userId - The user ID
   * @param {Array} interests - The interests array
   * @returns {Promise<void>}
   */
  async updateUserInterests(userId, interests) {
    try {
      const userDocRef = doc(db, "users", userId).withConverter(UserConverter);

      // Check if user exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      userData.interests = {
        total: interests.length,
        items: interests,
      };

      await updateDoc(userDocRef, UserConverter.toFirestore(userData));
    } catch (error) {
      console.error("Error updating user interests:", error);
      throw error;
    }
  },

  /**
   * Follow a user
   * @param {string} followerId - The ID of the user doing the following
   * @param {string} followingId - The ID of the user being followed
   * @returns {Promise<void>}
   */
  async followUser(followerId, followingId) {
    try {
      // Get follower user
      const followerDocRef = doc(db, "users", followerId).withConverter(
        UserConverter
      );
      const followerDoc = await getDoc(followerDocRef);

      if (!followerDoc.exists()) {
        throw new Error("Follower user not found");
      }

      // Add to following list
      const followerData = followerDoc.data();
      const added = followerData.addFollowing(followingId);

      if (added) {
        await updateDoc(
          followerDocRef,
          UserConverter.toFirestore(followerData)
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  },

  /**
   * Unfollow a user
   * @param {string} followerId - The ID of the user doing the unfollowing
   * @param {string} followingId - The ID of the user being unfollowed
   * @returns {Promise<void>}
   */
  async unfollowUser(followerId, followingId) {
    try {
      // Get follower user
      const followerDocRef = doc(db, "users", followerId).withConverter(
        UserConverter
      );
      const followerDoc = await getDoc(followerDocRef);

      if (!followerDoc.exists()) {
        throw new Error("Follower user not found");
      }

      // Remove from following list
      const followerData = followerDoc.data();
      const removed = followerData.removeFollowing(followingId);

      if (removed) {
        await updateDoc(
          followerDocRef,
          UserConverter.toFirestore(followerData)
        );
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  },

  /**
   * Search for users by username
   * @param {string} searchQuery - The search query
   * @param {number} maxResults - Maximum number of results to return
   * @returns {Promise<Array>} - Array of matching users
   */
  async searchUsers(searchQuery, maxResults = 10) {
    try {
      const usersRef = collection(db, "users");

      // Firebase doesn't support direct regex or LIKE queries, so we need to use startAt and endAt
      // with a range of characters that covers what the user has typed so far
      const searchLower = searchQuery.toLowerCase();
      const searchUpper = searchLower + "\uf8ff"; // High code point character

      const q = query(
        usersRef,
        where("username", ">=", searchLower),
        where("username", "<=", searchUpper),
        limit(maxResults)
      );

      const querySnapshot = await getDocs(q);

      const results = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        results.push({
          id: doc.id,
          username: userData.username,
          ppic: userData.ppic,
          displayName: userData.displayName,
          bio: userData.bio,
        });
      });

      return results;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  },

  /**
   * Get users by IDs
   * @param {Array<string>} userIds - Array of user IDs
   * @returns {Promise<Array>} - Array of user objects
   */
  async getUsersByIds(userIds) {
    try {
      const users = [];

      // Firebase has a limit on "in" queries, so we need to batch if there are many IDs
      const batchSize = 10;

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        const q = query(collection(db, "users"), where("id", "in", batch));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          users.push({
            id: doc.id,
            username: userData.username,
            ppic: userData.ppic,
            displayName: userData.displayName,
            bio: userData.bio,
          });
        });
      }

      return users;
    } catch (error) {
      console.error("Error getting users by IDs:", error);
      throw error;
    }
  },
};
