export default class PostSchema {
  constructor(
    id = "",
    images = [],
    hasCarousel = false,
    assciateUser = "",
    likes = 0,
    comments = [],
    saved = false
  ) {
    this.id = id;
    this.images = [];
    this.hasCarousel = hasCarousel;
    this.assciateUser = assciateUser;
    this.likes = likes;
    this.comments = comments;
    this.saved = saved;
  }

  getPostId() {
    return this.id;
  }

  getImages() {
    return this.images;
  }

  doesThePostHaveCarousel() {
    return this.hasCarousel;
  }

  whoPosted() {
    return this.assciateUser;
  }

  getLikes() {
    return this.likes;
  }

  getComments() {
    return this.comments;
  }

  hasUserSaved() {
    return this.saved;
  }

  setPostId(postId) {
    this.id = postId;
  }

  setImages(postRelatedImages) {
    this.images = postRelatedImages;
  }

  addImage(postRelatedImage) {
    this.images.push(postRelatedImage);
  }

  setCarousel(carouselStatus) {
    this.hasCarousel = carouselStatus;
  }

  setAssociatedUser(postedUser) {
    this.assciateUser = postedUser;
  }

  addLike() {
    if (/^-?[\d.]+(?:e-?\d+)?$/.test(this.following.total)) {
      ++this.likes;
    } else {
      throw new TypeError(
        "Post's like property's datatype has been changed. It is not integer. Can't update likes property of 'post'."
      );
    }
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  setSave(save) {
    this.saved = save;
  }

  toJSON() {
    return {
      id: this.id,
      images: this.images,
      hasCarousel: this.hasCarousel,
      assciateUser: this.assciateUser,
      likes: this.likes,
      comments: this.comments,
      saved: this.saved,
    };
  }
}

export const PostConverter = {
  toFirestore: (post) => {
    return {
      id: post.id,
      images: post.images,
      hasCarousel: post.hasCarousel,
      assciateUser: post.assciateUser,
      likes: post.likes,
      comments: post.comments,
      saved: post.saved,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new PostSchema(
      data.id,
      data.images,
      data.hasCarousel,
      data.assciateUser,
      data.likes,
      data.comments,
      data.saved
    );
  },
};
