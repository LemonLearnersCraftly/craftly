// models/Comments.js
export class CommentSchema {
  constructor(
    id = "",
    postId = "",
    userId = "",
    username = "",
    userImage = "",
    content = "",
    createdAt = new Date(),
    updatedAt = new Date(),
    likes = 0,
    replies = []
  ) {
    this.id = id;
    this.postId = postId;
    this.userId = userId;
    this.username = username;
    this.userImage = userImage;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.likes = likes;
    this.replies = replies; // For nested comments/replies
  }

  setId(id) {
    this.id = id;
  }

  addLike() {
    if (typeof this.likes === "number") {
      ++this.likes;
      return true;
    }
    return false;
  }

  removeLike() {
    if (typeof this.likes === "number" && this.likes > 0) {
      --this.likes;
      return true;
    }
    return false;
  }

  edit(newContent) {
    this.content = newContent;
    this.updatedAt = new Date();
  }

  addReply(reply) {
    this.replies.push(reply);
    this.updatedAt = new Date();
    return reply;
  }

  removeReply(replyId) {
    const initialLength = this.replies.length;
    this.replies = this.replies.filter((reply) => reply.id !== replyId);

    if (this.replies.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }

    return false;
  }

  toJSON() {
    return {
      id: this.id,
      postId: this.postId,
      userId: this.userId,
      username: this.username,
      userImage: this.userImage,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      likes: this.likes,
      replies: this.replies,
    };
  }
}

export const CommentConverter = {
  toFirestore: (comment) => {
    return {
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      username: comment.username,
      userImage: comment.userImage,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      likes: comment.likes,
      replies: comment.replies,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new CommentSchema(
      data.id,
      data.postId,
      data.userId,
      data.username,
      data.userImage,
      data.content,
      data.createdAt,
      data.updatedAt,
      data.likes,
      data.replies
    );
  },
};
