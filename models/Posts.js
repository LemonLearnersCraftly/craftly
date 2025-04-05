// models/Posts.js
export class PostSchema {
  constructor(
    id = "",
    description = "",
    images = [],
    hasCarousel = false,
    assciateUser = "", // Associate User (creator)
    likes = 0,
    comments = [],
    saved = false,
    categories = [], // For filtering/categorization
    materials = [], // Materials used in the craft
    difficulty = "", // Beginner, Intermediate, Advanced
    timeToMake = "", // Time it took to make the craft
    tutorial = false, // Is this a craft tutorial?
    tutorialSteps = [], // Steps for the tutorial
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    this.id = id;
    this.description = description;
    this.images = images;
    this.hasCarousel = hasCarousel;
    this.assciateUser = assciateUser;
    this.likes = likes;
    this.comments = comments;
    this.saved = saved;
    this.categories = categories;
    this.materials = materials;
    this.difficulty = difficulty;
    this.timeToMake = timeToMake;
    this.tutorial = tutorial;
    this.tutorialSteps = tutorialSteps;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters
  getPostId() {
    return this.id;
  }

  getDescription() {
    return this.description;
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

  getCategories() {
    return this.categories;
  }

  getMaterials() {
    return this.materials;
  }

  getDifficulty() {
    return this.difficulty;
  }

  getTimeToMake() {
    return this.timeToMake;
  }

  isTutorial() {
    return this.tutorial;
  }

  getTutorialSteps() {
    return this.tutorialSteps;
  }

  // Setters
  setId(postId) {
    this.id = postId;
  }

  setDescription(description) {
    this.description = description;
    this.updatedAt = new Date();
  }

  setImages(postRelatedImages) {
    this.images = postRelatedImages;
    this.updatedAt = new Date();
  }

  addImage(postRelatedImage) {
    this.images.push(postRelatedImage);
    this.updatedAt = new Date();
  }

  removeImage(imageUrl) {
    this.images = this.images.filter((img) => img !== imageUrl);
    this.updatedAt = new Date();
  }

  setCarousel(carouselStatus) {
    this.hasCarousel = carouselStatus;
    this.updatedAt = new Date();
  }

  setAssociatedUser(postedUser) {
    this.assciateUser = postedUser;
  }

  addLike() {
    if (
      typeof this.likes === "number" ||
      /^-?[\d.]+(?:e-?\d+)?$/.test(this.likes)
    ) {
      ++this.likes;
      return true;
    } else {
      throw new TypeError(
        "Post's like property's datatype has been changed. It is not integer."
      );
    }
  }

  removeLike() {
    if (
      typeof this.likes === "number" ||
      /^-?[\d.]+(?:e-?\d+)?$/.test(this.likes)
    ) {
      if (this.likes > 0) {
        --this.likes;
        return true;
      }
      return false; // Can't reduce below zero
    } else {
      throw new TypeError(
        "Post's like property's datatype has been changed. It is not integer."
      );
    }
  }

  addComment(comment) {
    this.comments.push(comment);
    this.updatedAt = new Date();
    return comment;
  }

  removeComment(commentId) {
    const initialLength = this.comments.length;
    this.comments = this.comments.filter((comment) => comment.id !== commentId);

    if (this.comments.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }

    return false;
  }

  setSave(save) {
    this.saved = save;
  }

  setCategories(categories) {
    this.categories = categories;
    this.updatedAt = new Date();
  }

  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  removeCategory(category) {
    const initialLength = this.categories.length;
    this.categories = this.categories.filter((cat) => cat !== category);

    if (this.categories.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }

    return false;
  }

  setMaterials(materials) {
    this.materials = materials;
    this.updatedAt = new Date();
  }

  addMaterial(material) {
    if (!this.materials.includes(material)) {
      this.materials.push(material);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  removeMaterial(material) {
    const initialLength = this.materials.length;
    this.materials = this.materials.filter((mat) => mat !== material);

    if (this.materials.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }

    return false;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.updatedAt = new Date();
  }

  setTimeToMake(timeToMake) {
    this.timeToMake = timeToMake;
    this.updatedAt = new Date();
  }

  setTutorial(isTutorial) {
    this.tutorial = isTutorial;
    this.updatedAt = new Date();
  }

  setTutorialSteps(steps) {
    this.tutorialSteps = steps;
    this.updatedAt = new Date();
  }

  addTutorialStep(step) {
    this.tutorialSteps.push(step);
    this.updatedAt = new Date();
    return step;
  }

  removeTutorialStep(stepId) {
    const initialLength = this.tutorialSteps.length;
    this.tutorialSteps = this.tutorialSteps.filter(
      (step) => step.id !== stepId
    );

    if (this.tutorialSteps.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }

    return false;
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      images: this.images,
      hasCarousel: this.hasCarousel,
      assciateUser: this.assciateUser,
      likes: this.likes,
      comments: this.comments,
      saved: this.saved,
      categories: this.categories,
      materials: this.materials,
      difficulty: this.difficulty,
      timeToMake: this.timeToMake,
      tutorial: this.tutorial,
      tutorialSteps: this.tutorialSteps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export const PostConverter = {
  // Firestore data converters for reading and writing objects of class "PostSchema"
  toFirestore: (post) => {
    return {
      id: post.id,
      description: post.description,
      images: post.images,
      hasCarousel: post.hasCarousel,
      assciateUser: post.assciateUser,
      likes: post.likes,
      comments: post.comments,
      saved: post.saved,
      categories: post.categories,
      materials: post.materials,
      difficulty: post.difficulty,
      timeToMake: post.timeToMake,
      tutorial: post.tutorial,
      tutorialSteps: post.tutorialSteps,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new PostSchema(
      data.id,
      data.description,
      data.images,
      data.hasCarousel,
      data.assciateUser,
      data.likes,
      data.comments,
      data.saved,
      data.categories || [],
      data.materials || [],
      data.difficulty || "",
      data.timeToMake || "",
      data.tutorial || false,
      data.tutorialSteps || [],
      data.createdAt,
      data.updatedAt
    );
  },
};
