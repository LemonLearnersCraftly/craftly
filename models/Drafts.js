export class DraftSchema {
  constructor(
    id = "",
    description = "",
    images = [],
    hasCarousel = false,
    associateUser = "",
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    this.id = id;
    this.description = description;
    this.images = images;
    this.hasCarousel = hasCarousel;
    this.associateUser = associateUser;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
      data.createdAt,
      data.updatedAt
    );
  },
};
