// models/SavedArticles.js
export class SavedArticleSchema {
  constructor(
    id = "",
    articleId = "",
    userId = "",
    title = "",
    image = "",
    author = "",
    link = "",
    readTime = "",
    categories = [],
    createdAt = new Date()
  ) {
    this.id = id;
    this.articleId = articleId;
    this.userId = userId;
    this.title = title;
    this.image = image;
    this.author = author;
    this.link = link;
    this.readTime = readTime;
    this.categories = categories;
    this.createdAt = createdAt;
  }

  setId(id) {
    this.id = id;
  }

  toJSON() {
    return {
      id: this.id,
      articleId: this.articleId,
      userId: this.userId,
      title: this.title,
      image: this.image,
      author: this.author,
      link: this.link,
      readTime: this.readTime,
      categories: this.categories,
      createdAt: this.createdAt,
    };
  }
}

export const SavedArticleConverter = {
  toFirestore: (savedArticle) => {
    return {
      id: savedArticle.id,
      articleId: savedArticle.articleId,
      userId: savedArticle.userId,
      title: savedArticle.title,
      image: savedArticle.image,
      author: savedArticle.author,
      link: savedArticle.link,
      readTime: savedArticle.readTime,
      categories: savedArticle.categories,
      createdAt: savedArticle.createdAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new SavedArticleSchema(
      data.id,
      data.articleId,
      data.userId,
      data.title,
      data.image,
      data.author,
      data.link,
      data.readTime,
      data.categories || [],
      data.createdAt
    );
  },
};
