// services/articleService.js
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
import {
  SavedArticleSchema,
  SavedArticleConverter,
} from "@/models/SavedArticles";

export const articleService = {
  /**
   * Save an article
   * @param {string} userId - The user ID
   * @param {Object} articleData - The article data
   * @returns {Promise<string>} - The ID of the saved article
   */
  async saveArticle(userId, articleData) {
    try {
      // Check if already saved
      const savedQuery = query(
        collection(db, "savedArticles"),
        where("articleId", "==", articleData.articleId),
        where("userId", "==", userId)
      );

      const savedSnapshot = await getDocs(savedQuery);

      if (!savedSnapshot.empty) {
        return savedSnapshot.docs[0].id; // Already saved
      }

      // Create saved article document
      const savedArticle = new SavedArticleSchema(
        "",
        articleData.articleId,
        userId,
        articleData.title,
        articleData.image,
        articleData.author,
        articleData.link,
        articleData.readTime,
        articleData.categories
      );

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, "savedArticles"),
        SavedArticleConverter.toFirestore(savedArticle)
      );

      // Update with the generated ID
      savedArticle.id = docRef.id;
      await updateDoc(docRef, { id: docRef.id });

      // Update user's saved articles
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.savedArticles) {
          await updateDoc(userRef, {
            "savedArticles.total": increment(1),
            "savedArticles.items": arrayUnion({
              id: userData.savedArticles.items.length + 1,
              articleId: articleData.articleId,
              title: articleData.title,
              savedAt: serverTimestamp(),
            }),
          });
        }
      }

      return docRef.id;
    } catch (error) {
      console.error("Error saving article:", error);
      throw error;
    }
  },

  /**
   * Unsave an article
   * @param {string} articleId - The article ID
   * @param {string} userId - The user ID
   * @returns {Promise<void>}
   */
  async unsaveArticle(articleId, userId) {
    try {
      // Find the saved article document
      const savedQuery = query(
        collection(db, "savedArticles"),
        where("articleId", "==", articleId),
        where("userId", "==", userId)
      );

      const savedSnapshot = await getDocs(savedQuery);

      if (savedSnapshot.empty) {
        return; // Not saved
      }

      // Delete saved article document
      await deleteDoc(savedSnapshot.docs[0].ref);

      // Update user's saved articles
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.savedArticles && userData.savedArticles.items) {
          // Filter out the unsaved article
          const updatedItems = userData.savedArticles.items.filter(
            (item) => item.articleId !== articleId
          );

          await updateDoc(userRef, {
            "savedArticles.total": updatedItems.length,
            "savedArticles.items": updatedItems,
          });
        }
      }
    } catch (error) {
      console.error("Error unsaving article:", error);
      throw error;
    }
  },

  /**
   * Check if user has saved an article
   * @param {string} articleId - The article ID
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} - Whether the user has saved the article
   */
  async hasUserSavedArticle(articleId, userId) {
    try {
      const savedQuery = query(
        collection(db, "savedArticles"),
        where("articleId", "==", articleId),
        where("userId", "==", userId)
      );

      const savedSnapshot = await getDocs(savedQuery);

      return !savedSnapshot.empty;
    } catch (error) {
      console.error("Error checking article save status:", error);
      throw error;
    }
  },

  /**
   * Get saved articles for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of saved articles
   */
  async getSavedArticles(userId) {
    try {
      const savedQuery = query(
        collection(db, "savedArticles"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const savedSnapshot = await getDocs(savedQuery);

      const articles = [];
      savedSnapshot.forEach((doc) => {
        articles.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return articles;
    } catch (error) {
      console.error("Error getting saved articles:", error);
      throw error;
    }
  },
};
