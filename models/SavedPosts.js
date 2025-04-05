// models/SavedPosts.js
export class SavedPostSchema {
  constructor(id = "", postId = "", userId = "", createdAt = new Date()) {
    this.id = id;
    this.postId = postId;
    this.userId = userId;
    this.createdAt = createdAt;
  }

  setId(id) {
    this.id = id;
  }

  toJSON() {
    return {
      id: this.id,
      postId: this.postId,
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }
}

export const SavedPostConverter = {
  toFirestore: (savedPost) => {
    return {
      id: savedPost.id,
      postId: savedPost.postId,
      userId: savedPost.userId,
      createdAt: savedPost.createdAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new SavedPostSchema(
      data.id,
      data.postId,
      data.userId,
      data.createdAt
    );
  },
};
