interface Interest {
  total: number;
  items: string[];
}

interface Following {
  total: number;
  items: { id: number, followRef: string }[];
}

interface Post {
  total: number;
  items: { id: number, postRef: string }[];
}

export class UserSchema {
  id: string;
  username: string;
  email: string;
  following: Following;
  posts: Post;
  interests: Interest;

  constructor(
    id: string = "",
    username: string = "",
    email: string = "",
    following: Following = { total: 0, items: [] },
    posts: Post = { total: 0, items: [] },
    interests: Interest = { total: 0, items: [] }
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.following = following;
    this.posts = posts;
    this.interests = interests;
  }

  addFollowing(followingId: string): void {
    this.following.total++;
    this.following.items.push({
      id: this.following.total,
      followRef: followingId,
    });
  }

  addPost(postId: string): void {
    this.posts.total++;
    this.posts.items.push({ id: this.posts.total, postRef: postId });
  }

  totalFollowers(): number {
    return this.following.total;
  }

  getFollowers(): { id: number, followRef: string }[] {
    return this.following.items;
  }

  getPosts(): { id: number, postRef: string }[] {
    return this.posts.items;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getUserId(): string {
    return this.id;
  }

  setId(userId: string): void {
    this.id = userId;
  }

  setInterests(interests: string[]): void {
    this.interests.total = interests.length;
    this.interests.items = interests;
  }

  addInterest(interest: string): void {
    if (!this.interests.items.includes(interest)) {
      this.interests.items.push(interest);
      this.interests.total++;
    }
  }

  toJSON(): object {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      following: this.following,
      posts: this.posts,
      interests: this.interests,
    };
  }
}

export const UserConverter = {
  toFirestore: (user: UserSchema) => {
    return user.toJSON();
  },
  fromFirestore: (snapshot: any, options: any): UserSchema => {
    const data = snapshot.data(options);
    return new UserSchema(
      data.id,
      data.username,
      data.email,
      data.following,
      data.posts,
      data.interests
    );
  },
};
