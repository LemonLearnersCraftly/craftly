export default class UserSchema {
  constructor(id = "", username = "", email = "", following = {}, posts = {}) {
    this.id = ""; // if user is not created, else get Id from firestore of user document
    this.username = username; // retrieve from auth
    this.email = email; // retrieve from auth
    this.following = {
      total: 0, // populate from firestore
      items: [], // populate from firestore
    };
    this.posts = {
      total: 0,
      items: [],
    }; // populate from firestore
  }

  addFollowing(followingId) {
    if (/^-?[\d.]+(?:e-?\d+)?$/.test(this.following.total)) {
      ++this.following.total;
      this.following.items = [
        ...this.following.items,
        { id: this.following.total, followRef: followingId },
      ];
    } else {
      throw new TypeError(
        "User's following object's total property's datatype has been changed. It is not integer. Can't update total property of 'following'."
      );
    }
  }

  addPost(postId) {
    if (/^-?[\d.]+(?:e-?\d+)?$/.test(this.posts.total)) {
      ++this.posts.total;
      this.posts.items = [
        ...this.posts.items,
        { id: this.posts.total, postRef: postId },
      ];
    } else {
      throw new TypeError(
        "User's posts object's total property's datatype has been changed. It is not integer. Can't update total property of 'posts'."
      );
    }
  }

  totalFollowers() {
    return this.following.total;
  }

  getFollowers() {
    return this.following.items;
  }

  getPosts() {
    return this.posts.items;
  }

  getUsername() {
    return this.username;
  }

  getEmail() {
    return this.email;
  }

  getUserId() {
    return this.id;
  }

  setUserId(userId) {
    this.id = userId;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      following: {
        total: this.following.total,
        items: this.following.items,
      },
      posts: {
        total: this.posts.total,
        items: this.posts.items,
      },
    };
  }
}

export const UserConverter = {
  toFirestore: (user) => {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      following: user.following,
      posts: user.posts,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new UserSchema(
      data.id,
      data.username,
      data.email,
      data.following,
      data.posts
    );
  },
};
