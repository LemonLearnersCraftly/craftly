// models/Users.js
export class UserSchema {
  constructor(
    id = "",
    ppic = "",
    username = "",
    email = "",
    following = null,
    posts = null,
    interests = null,
    savedPosts = null,
    savedArticles = null,
    bio = "",
    displayName = "",
    createdAt = new Date(),
    lastActive = new Date()
  ) {
    this.id = id; // Clerk user ID
    this.ppic = ppic; // Profile picture URL
    this.username = username; // Username (unique)
    this.email = email; // Email address
    this.displayName = displayName; // Display name (can be different from username)
    this.bio = bio; // User bio/description
    this.following = following || {
      total: 0,
      items: [], // Array of {id, followRef} objects
    };
    this.posts = posts || {
      total: 0,
      items: [], // Array of {id, postRef} objects
    };
    this.interests = interests || {
      total: 0,
      items: [], // Array of {category, subcategory?} objects
    };
    this.savedPosts = savedPosts || {
      total: 0,
      items: [], // Array of {id, postRef, savedAt} objects
    };
    this.savedArticles = savedArticles || {
      total: 0,
      items: [], // Array of {id, articleId, title, savedAt} objects
    };
    this.createdAt = createdAt;
    this.lastActive = lastActive;
  }

  // Following methods
  addFollowing(followingId) {
    if (typeof this.following.total === "number") {
      // Check if already following
      if (this.following.items.some((item) => item.followRef === followingId)) {
        return false; // Already following
      }

      ++this.following.total;
      this.following.items.push({
        id: this.following.total,
        followRef: followingId,
        followedAt: new Date(),
      });
      return true;
    } else {
      throw new TypeError(
        "User's following object's total property's datatype has been changed. It is not integer."
      );
    }
  }

  removeFollowing(followingId) {
    const initialLength = this.following.items.length;

    this.following.items = this.following.items.filter(
      (item) => item.followRef !== followingId
    );

    const removed = initialLength > this.following.items.length;

    if (removed) {
      this.following.total = Math.max(0, this.following.total - 1);
    }

    return removed;
  }

  // Posts methods
  addPost(postId) {
    if (typeof this.posts.total === "number") {
      ++this.posts.total;
      this.posts.items.push({
        id: this.posts.total,
        postRef: postId,
        postedAt: new Date(),
      });
      return true;
    } else {
      throw new TypeError(
        "User's posts object's total property's datatype has been changed. It is not integer."
      );
    }
  }

  removePost(postId) {
    const initialLength = this.posts.items.length;

    this.posts.items = this.posts.items.filter(
      (item) => item.postRef !== postId
    );

    const removed = initialLength > this.posts.items.length;

    if (removed) {
      this.posts.total = Math.max(0, this.posts.total - 1);
    }

    return removed;
  }

  // Saved posts methods
  savePost(postId, postData = {}) {
    if (typeof this.savedPosts.total === "number") {
      // Check if already saved
      if (this.savedPosts.items.some((item) => item.postRef === postId)) {
        return false; // Already saved
      }

      ++this.savedPosts.total;
      this.savedPosts.items.push({
        id: this.savedPosts.total,
        postRef: postId,
        savedAt: new Date(),
        ...postData,
      });
      return true;
    } else {
      throw new TypeError(
        "User's savedPosts object's total property's datatype has been changed. It is not integer."
      );
    }
  }

  unsavePost(postId) {
    const initialLength = this.savedPosts.items.length;

    this.savedPosts.items = this.savedPosts.items.filter(
      (item) => item.postRef !== postId
    );

    const removed = initialLength > this.savedPosts.items.length;

    if (removed) {
      this.savedPosts.total = Math.max(0, this.savedPosts.total - 1);
    }

    return removed;
  }

  // Saved articles methods
  saveArticle(articleId, articleData = {}) {
    if (typeof this.savedArticles.total === "number") {
      // Check if already saved
      if (
        this.savedArticles.items.some((item) => item.articleId === articleId)
      ) {
        return false; // Already saved
      }

      ++this.savedArticles.total;
      this.savedArticles.items.push({
        id: this.savedArticles.total,
        articleId,
        savedAt: new Date(),
        ...articleData,
      });
      return true;
    } else {
      throw new TypeError(
        "User's savedArticles object's total property's datatype has been changed. It is not integer."
      );
    }
  }

  unsaveArticle(articleId) {
    const initialLength = this.savedArticles.items.length;

    this.savedArticles.items = this.savedArticles.items.filter(
      (item) => item.articleId !== articleId
    );

    const removed = initialLength > this.savedArticles.items.length;

    if (removed) {
      this.savedArticles.total = Math.max(0, this.savedArticles.total - 1);
    }

    return removed;
  }

  // Interest methods
  setInterests(interests) {
    this.interests.total = interests.length;
    this.interests.items = interests;
  }

  addInterest(category, subcategory = null) {
    // Check if the interest already exists
    const exists = this.interests.items.some(
      (item) =>
        item.category === category &&
        (subcategory === null || item.subcategory === subcategory)
    );

    if (!exists) {
      const interestItem = { category };
      if (subcategory) {
        interestItem.subcategory = subcategory;
      }

      this.interests.items.push(interestItem);
      this.interests.total = this.interests.items.length;
      return true;
    }

    return false;
  }

  removeInterest(category, subcategory = null) {
    const initialLength = this.interests.items.length;

    if (subcategory === null) {
      // Remove all items with this category
      this.interests.items = this.interests.items.filter(
        (item) => item.category !== category
      );
    } else {
      // Remove specific category + subcategory combo
      this.interests.items = this.interests.items.filter(
        (item) =>
          !(item.category === category && item.subcategory === subcategory)
      );
    }

    const removed = initialLength > this.interests.items.length;

    if (removed) {
      this.interests.total = this.interests.items.length;
    }

    return removed;
  }

  // Utility methods
  getUserId() {
    return this.id;
  }

  getUsername() {
    return this.username;
  }

  getEmail() {
    return this.email;
  }

  getFollowingCount() {
    return this.following.total;
  }

  getFollowers() {
    return this.following.items;
  }

  getPosts() {
    return this.posts.items;
  }

  getInterests() {
    return this.interests.items;
  }

  getSavedPosts() {
    return this.savedPosts.items;
  }

  getSavedArticles() {
    return this.savedArticles.items;
  }

  setId(userId) {
    this.id = userId;
  }

  updateLastActive() {
    this.lastActive = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      ppic: this.ppic,
      username: this.username,
      email: this.email,
      displayName: this.displayName,
      bio: this.bio,
      following: {
        total: this.following.total,
        items: this.following.items,
      },
      posts: {
        total: this.posts.total,
        items: this.posts.items,
      },
      interests: {
        total: this.interests.total,
        items: this.interests.items,
      },
      savedPosts: {
        total: this.savedPosts.total,
        items: this.savedPosts.items,
      },
      savedArticles: {
        total: this.savedArticles.total,
        items: this.savedArticles.items,
      },
      createdAt: this.createdAt,
      lastActive: this.lastActive,
    };
  }
}

export const UserConverter = {
  // Firestore data converters for reading and writing objects of class "UserSchema"
  toFirestore: (user) => {
    return {
      id: user.id,
      ppic: user.ppic,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      following: {
        total: user.following.total,
        items: user.following.items,
      },
      posts: {
        total: user.posts.total,
        items: user.posts.items,
      },
      interests: {
        total: user.interests.total,
        items: user.interests.items,
      },
      savedPosts: {
        total: user.savedPosts.total,
        items: user.savedPosts.items,
      },
      savedArticles: {
        total: user.savedArticles.total,
        items: user.savedArticles.items,
      },
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new UserSchema(
      data.id,
      data.ppic,
      data.username,
      data.email,
      data.following,
      data.posts,
      data.interests,
      data.savedPosts,
      data.savedArticles,
      data.bio,
      data.displayName,
      data.createdAt,
      data.lastActive
    );
  },
};
