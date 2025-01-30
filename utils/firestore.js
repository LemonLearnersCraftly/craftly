import { getFirestore, collection, addDoc } from "@firebase/firestore";
import firebaseApp from "./firebaseConfig";

// Connect to database
const db = getFirestore(firebaseApp);
console.log("Database Connected!");

export const addData = async (collectionName, data) => {
  // Accepts name of collection (table) and data (object with key value pairs)
  // Adds data to firebase
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default db;
