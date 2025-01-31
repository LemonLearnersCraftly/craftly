import { getFirestore, collection, doc, setDoc, updateDoc } from "@firebase/firestore";
import firebaseApp from "./firebaseConfig";

// Connect to database
const db = getFirestore(firebaseApp);
console.log("Database Connected!");

export const addData = async (collectionName, data) => {
  // Accepts name of collection (table) and data (object with key value pairs)
  // Adds data to firebase
  const newDataRef = doc(collection(db, collectionName));
  data.id = newDataRef.id;
  try {
    await setDoc(newDataRef, data);
    console.log("Document written with ID: ", newDataRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const updateData = async(collectionName, data) => {
  const docRef = doc(collection(db, collectionName), data.id);
  try{
    await updateDoc(docRef, data);
    console.log(`Document with id ${data.id} which is a part of ${collectionName} was updated.`);
  } catch(e){
    console.error("Error updating the document: ", e);
  }
}

export default db;
