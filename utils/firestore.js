import { getFirestore, collection, addDoc } from "@firebase/firestore";
import firebaseApp from "./firebaseConfig";

const db = getFirestore(firebaseApp);
console.log("Database Connected!");

export const addData = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default db;
