# Craftly

Our very own crafting website

## Documenting Code (Setup):

1. `layout.js`: Defines layout for that folder. It can be overriden with different layout.js files for different folders.
2. `page.js`: This becomes the actual page. The address of that page will be everything after `app`. If the folder is a subfolder of app folder, then you can visit that folder's page at `localhost:3000/<name_of_folder>`
3. `firebaseConfig.js`, `.firebaserc`, `firebase.json`, `firestore.json`: Defines configuration for Firebase.
4. `signup.js`: This is the Sign Up page where users can create an account.
5. `login.js`: This is the Log In page where users can log in to their account through Craftly or a third party login through Google.

> [!CAUTION] 
> `firebaseConfig.js, .firebaserc, firebase.json, firestore.json` DO NOT CHANGE UNTIL ABSOLUTELY NECESSARY
