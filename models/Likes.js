// models/Likes.js
export class LikeSchema {
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

export const LikeConverter = {
  toFirestore: (like) => {
    return {
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new LikeSchema(data.id, data.postId, data.userId, data.createdAt);
  },
};
