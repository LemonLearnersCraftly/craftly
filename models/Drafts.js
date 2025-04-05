// models/Drafts.js
export class DraftSchema {
  constructor(
    id = "",
    description = "",
    images = [],
    hasCarousel = false,
    associateUser = "",
    categories = [],
    materials = [],
    difficulty = "",
    timeToMake = "",
    tutorial = false,
    tutorialSteps = [],
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    this.id = id;
    this.description = description;
    this.images = images;
    this.hasCarousel = hasCarousel;
    this.associateUser = associateUser;
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
  getDraftId() {
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

  getAssociateUser() {
    return this.associateUser;
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
  setId(id) {
    this.id = id;
  }

  setDescription(description) {
    this.description = description;
    this.updatedAt = new Date();
  }

  setImages(images) {
    this.images = images;
    this.updatedAt = new Date();
  }

  addImage(image) {
    this.images.push(image);
    this.updatedAt = new Date();
  }

  removeImage(imageUrl) {
    this.images = this.images.filter((image) => image !== imageUrl);
    this.updatedAt = new Date();
  }

  setCarousel(hasCarousel) {
    this.hasCarousel = hasCarousel;
    this.updatedAt = new Date();
  }

  setAssociateUser(userId) {
    this.associateUser = userId;
  }

  setCategories(categories) {
    this.categories = categories;
    this.updatedAt = new Date();
  }

  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
      this.updatedAt = new Date();
    }
  }

  removeCategory(category) {
    this.categories = this.categories.filter((cat) => cat !== category);
    this.updatedAt = new Date();
  }

  setMaterials(materials) {
    this.materials = materials;
    this.updatedAt = new Date();
  }

  addMaterial(material) {
    if (!this.materials.includes(material)) {
      this.materials.push(material);
      this.updatedAt = new Date();
    }
  }

  removeMaterial(material) {
    this.materials = this.materials.filter((mat) => mat !== material);
    this.updatedAt = new Date();
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
  }

  removeTutorialStep(stepId) {
    this.tutorialSteps = this.tutorialSteps.filter(
      (step) => step.id !== stepId
    );
    this.updatedAt = new Date();
  }

  // Convert to Post
  toPostSchema() {
    return {
      description: this.description,
      images: this.images,
      hasCarousel: this.hasCarousel,
      assciateUser: this.associateUser,
      categories: this.categories,
      materials: this.materials,
      difficulty: this.difficulty,
      timeToMake: this.timeToMake,
      tutorial: this.tutorial,
      tutorialSteps: this.tutorialSteps,
      likes: 0,
      comments: [],
      saved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      images: this.images,
      hasCarousel: this.hasCarousel,
      associateUser: this.associateUser,
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

export const DraftConverter = {
  // Firestore data converters for reading and writing objects of class "DraftSchema"
  toFirestore: (draft) => {
    return {
      id: draft.id,
      description: draft.description,
      images: draft.images,
      hasCarousel: draft.hasCarousel,
      associateUser: draft.associateUser,
      categories: draft.categories,
      materials: draft.materials,
      difficulty: draft.difficulty,
      timeToMake: draft.timeToMake,
      tutorial: draft.tutorial,
      tutorialSteps: draft.tutorialSteps,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new DraftSchema(
      data.id,
      data.description,
      data.images,
      data.hasCarousel,
      data.associateUser,
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
