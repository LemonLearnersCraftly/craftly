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
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/utils/firestore";
import { DraftSchema, DraftConverter } from "../models/Drafts";

export const draftService = {
  /**
   * Create a new draft
   * @param {DraftSchema} draftData - The draft data
   * @param {Array<File>} imageFiles - Array of image files to upload
   * @returns {Promise<string>} - The ID of the created draft
   */
  async createDraft(draftData, imageFiles = []) {
    try {
      // Upload images if provided
      if (imageFiles.length > 0) {
        const imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const storagePath = `drafts/${
              draftData.associateUser
            }/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, storagePath);

            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );

        draftData.images = imageUrls;
        draftData.hasCarousel = imageUrls.length > 1;
      }

      // Set timestamps
      draftData.createdAt = serverTimestamp();
      draftData.updatedAt = serverTimestamp();

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, "drafts"),
        DraftConverter.toFirestore(draftData)
      );

      // Update with the generated ID
      draftData.id = docRef.id;
      await updateDoc(docRef, { id: docRef.id });

      return docRef.id;
    } catch (error) {
      console.error("Error creating draft:", error);
      throw error;
    }
  },

  /**
   * Get a draft by ID
   * @param {string} draftId - The draft ID
   * @returns {Promise<DraftSchema|null>} - The draft object or null if not found
   */
  async getDraftById(draftId) {
    try {
      const draftDocRef = doc(db, "drafts", draftId).withConverter(
        DraftConverter
      );
      const draftDoc = await getDoc(draftDocRef);

      if (draftDoc.exists()) {
        return draftDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting draft:", error);
      throw error;
    }
  },

  /**
   * Update a draft
   * @param {string} draftId - The draft ID
   * @param {Object} updates - The fields to update
   * @returns {Promise<void>}
   */
  async updateDraft(draftId, updates) {
    try {
      const draftDocRef = doc(db, "drafts", draftId).withConverter(
        DraftConverter
      );

      // Set update timestamp
      updates.updatedAt = serverTimestamp();

      await updateDoc(draftDocRef, updates);
    } catch (error) {
      console.error("Error updating draft:", error);
      throw error;
    }
  },

  /**
   * Delete a draft
   * @param {string} draftId - The draft ID
   * @param {string} userId - The user ID (for validation)
   * @returns {Promise<void>}
   */
  async deleteDraft(draftId, userId) {
    try {
      const draftDocRef = doc(db, "drafts", draftId);
      const draftDoc = await getDoc(draftDocRef);

      if (!draftDoc.exists()) {
        throw new Error("Draft not found");
      }

      const draftData = draftDoc.data();

      // Check that the user owns this draft
      if (draftData.associateUser !== userId) {
        throw new Error("Unauthorized to delete this draft");
      }

      // Delete images from storage
      if (draftData.images && draftData.images.length > 0) {
        await Promise.all(
          draftData.images.map(async (imageUrl) => {
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

      // Finally delete the draft
      await deleteDoc(draftDocRef);
    } catch (error) {
      console.error("Error deleting draft:", error);
      throw error;
    }
  },

  /**
   * Get drafts for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of drafts
   */
  async getUserDrafts(userId) {
    try {
      const draftsQuery = query(
        collection(db, "drafts"),
        where("associateUser", "==", userId),
        orderBy("updatedAt", "desc")
      );

      const draftsSnapshot = await getDocs(draftsQuery);

      const drafts = [];
      draftsSnapshot.forEach((doc) => {
        drafts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return drafts;
    } catch (error) {
      console.error("Error getting user drafts:", error);
      throw error;
    }
  },

  /**
   * Publish a draft as a post
   * @param {string} draftId - The draft ID
   * @param {string} userId - The user ID (for validation)
   * @returns {Promise<string>} - The ID of the published post
   */
  async publishDraft(draftId, userId) {
    try {
      const draftDocRef = doc(db, "drafts", draftId).withConverter(
        DraftConverter
      );
      const draftDoc = await getDoc(draftDocRef);

      if (!draftDoc.exists()) {
        throw new Error("Draft not found");
      }

      const draftData = draftDoc.data();

      // Check that the user owns this draft
      if (draftData.associateUser !== userId) {
        throw new Error("Unauthorized to publish this draft");
      }

      // Convert draft to post
      const postData = draftData.toPostSchema();

      // Create the post
      const postRef = await addDoc(collection(db, "posts"), {
        ...postData,
        assciateUser: userId, // Ensure correct spelling (note: it's misspelled in the original code)
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update with the generated ID
      await updateDoc(postRef, { id: postRef.id });

      // Update user's posts collection
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.posts) {
          await updateDoc(userRef, {
            "posts.total": increment(1),
            "posts.items": arrayUnion({
              id: userData.posts.items.length + 1,
              postRef: postRef.id,
              postedAt: serverTimestamp(),
            }),
          });
        }
      }

      // Delete the draft
      await deleteDoc(draftDocRef);

      return postRef.id;
    } catch (error) {
      console.error("Error publishing draft:", error);
      throw error;
    }
  },
};
