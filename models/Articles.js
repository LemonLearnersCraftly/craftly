export class ArticleSchema {
    constructor(id = "", title = "", author = "", website = "", imageUrl = "") {
      this.id = id;
      this.title = title;
      this.author = author;
      this.website = website;
      this.imageUrl = imageUrl;
    }
  
    getArticleId() {
      return this.id;
    }
  
    getTitle() {
      return this.title;
    }
  
    getAuthor() {
      return this.author;
    }
  
    getWebsite() {
      return this.website;
    }
  
    getImageUrl() {
      return this.imageUrl;
    }
  
    setTitle(title) {
      this.title = title;
    }
  
    setAuthor(author) {
      this.author = author;
    }
  
    setWebsite(website) {
      this.website = website;
    }
  
    setImageUrl(imageUrl) {
      this.imageUrl = imageUrl;
    }
  
    toJSON() {
      return {
        id: this.id,
        title: this.title,
        author: this.author,
        website: this.website,
        imageUrl: this.imageUrl,
      };
    }
  }
  
  export const ArticleConverter = {
    toFirestore: (article) => {
      return {
        id: article.id,
        title: article.title,
        author: article.author,
        website: article.website,
        imageUrl: article.imageUrl,
      };
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new ArticleSchema(data.id, data.title, data.author, data.website, data.imageUrl);
    },
  };
  