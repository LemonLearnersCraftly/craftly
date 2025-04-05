// models/Follows.js
export class FollowSchema {
  constructor(
    id = "",
    followerId = "", // User doing the following
    followingId = "", // User being followed
    createdAt = new Date()
  ) {
    this.id = id;
    this.followerId = followerId;
    this.followingId = followingId;
    this.createdAt = createdAt;
  }

  setId(id) {
    this.id = id;
  }

  toJSON() {
    return {
      id: this.id,
      followerId: this.followerId,
      followingId: this.followingId,
      createdAt: this.createdAt,
    };
  }
}

export const FollowConverter = {
  toFirestore: (follow) => {
    return {
      id: follow.id,
      followerId: follow.followerId,
      followingId: follow.followingId,
      createdAt: follow.createdAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new FollowSchema(
      data.id,
      data.followerId,
      data.followingId,
      data.createdAt
    );
  },
};
