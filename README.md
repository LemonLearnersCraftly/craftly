# Craftly

Our very own crafting website

## Documenting Code (Setup):

1. `layout.js`: Defines layout for that folder. It can be overriden with different layout.js files for different folders.
2. `page.js`: This becomes the actual page. The address of that page will be everything after `app`. If the folder is a subfolder of app folder, then you can visit that folder's page at `localhost:3000/<name_of_folder>`
3. `firebaseConfig.js`, `.firebaserc`, `firebase.json`, `firestore.json`: Defines configuration for Firebase.

> [!CAUTION] 
> `firebaseConfig.js, .firebaserc, firebase.json, firestore.json` DO NOT CHANGE UNTIL ABSOLUTELY NECESSARY
