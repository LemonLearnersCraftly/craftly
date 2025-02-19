import { storage } from "../../utils/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { nanoid } from "nanoid";

export const uploadFile = async (file, folder) => {
  // By default files are uploaded to STORAGE_FOLDER_PATH/user location
  // TO DO: update security rules in cloud to prevent unauthenticated user uploads
  // TO DO: add metadata to images about user to know who uploaded what OR track them via database OR make folders/subfolders in google cloud
  try {
    const filename = nanoid(); // generates a unique string ID for filename (for anonymity, essentially what your file name is, will not be what you see in Google Cloud storage section)
    const storageRef = ref(
      storage,
      `${folder}${filename}.${file.name.split(".").pop()}`
    );
    // Create a reference to a file upload (works just like creating a reference for document in database except we have nothing to do with the upload's ID)
    const res = await uploadBytes(storageRef, file); // upload that stuff

    return res.metadata.fullPath; // get the full path (has STORAGE_FOLDER_PATH)
  } catch (error) {
    throw error;
  }
};

export const getFile = async (path) => {
  // Retrieve file from cloud
  // TO DO FUTURE: check if user can access that file (if going for privacy)
  // TO DO: limit access to only authenticated users
  try {
    const fileRef = ref(storage, path); // pass url and storage object to get reference to that file/image that was uploaded
    return getDownloadURL(fileRef); // get URL of the image
  } catch (error) {
    throw error;
  }
};
