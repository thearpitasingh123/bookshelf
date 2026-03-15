import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDW0XceictUQZgOZ2hD0AVgP5v03aW6wAs",
  authDomain: "bookshelf-5fea7.firebaseapp.com",
  projectId: "bookshelf-5fea7",
  storageBucket: "bookshelf-5fea7.firebasestorage.app",
  messagingSenderId: "622349484454",
  appId: "1:622349484454:web:94c93a6bbe94d951354f67"
};

const app = initializeApp(firebaseConfig);


/* SERVICES */

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* GOOGLE LOGIN */

export const provider = new GoogleAuthProvider();