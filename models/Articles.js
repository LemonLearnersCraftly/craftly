export class ArticleSchema {
    constructor(id = "", image = "", link = "") {
      this.id = id;
      this.image = image;
      this.link = link;
    }
  
    getArticleId() {
      return this.id;
    }
  
    getImage() {
      return this.image;
    }
  
    getLink() {
      return this.link;
    }
  
    setImage(image) {
      this.image = image;
    }
  
    setLink(link) {
      this.link = link;
    }
  
    toJSON() {
      return {
        id: this.id,
        title: this.image,
        author: this.link,
      };
    }
  }
  
  export const ArticleConverter = {
    toFirestore: (article) => {
      return {
        id: article.id,
        image: article.image,
        link: article.link,
      };
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new ArticleSchema(data.id, data.image, data.link);
    },
  };
  