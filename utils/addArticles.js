import fs from 'fs';
import { addData } from './firestoreUtils';
import { ArticleSchema } from '../models/Articles';

// Read the JSON file containing articles
const articlesFile = './articles.json';

fs.readFile(articlesFile, 'utf-8', async (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const articles = JSON.parse(data);

    // Loop through the articles and add each one to the Firestore
    for (const articleData of articles) {
      const article = new ArticleSchema(
        articleData.id,
        articleData.title,
        articleData.author,
        articleData.website,
        articleData.imageUrl
      );

      // Convert article schema to Firestore format
      const articleDataForFirestore = article.toJSON();

      // Add article to Firestore collection
      await addData('articles', articleDataForFirestore);
      console.log(`Article "${articleData.title}" added to Firestore`);
    }
  } catch (e) {
    console.error('Error processing articles:', e);
  }
});
