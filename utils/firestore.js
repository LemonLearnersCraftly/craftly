import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { app } from "./firebaseConfig";

// Connect to database
export const db = getFirestore(app);
console.log("Database Connected!");

export const addData = async (collectionName, data, converter = null) => {
  let collectionRef = collection(db, collectionName);
  let docRef = doc(collectionRef);

  // Apply converter if valid
  if (converter?.toFirestore && converter?.fromFirestore) {
    collectionRef = collectionRef.withConverter(converter);
    docRef = doc(collectionRef); // Recreate doc reference with converter
  }

  data.setId(docRef.id);

  try {
    await setDoc(
      docRef,
      // Convert data using converter if available, else use raw data
      converter ? data : JSON.stringify(data)
    );
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const updateData = async (collectionName, data) => {
  const docRef = doc(collection(db, collectionName), data.id);
  try {
    await updateDoc(docRef, data);
    console.log(
      `Document with id ${data.id} which is a part of ${collectionName} was updated.`
    );
  } catch (e) {
    console.error("Error updating the document: ", e);
  }
};

export default db;
