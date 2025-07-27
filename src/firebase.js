import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBoMg3_s1sKQtzOnaS6ISODsy9lW_oDNK4",
  authDomain: "langar-backend.firebaseapp.com",
  projectId: "langar-backend",
  storageBucket: "langar-backend.firebasestorage.app",
  messagingSenderId: "38445222334",
  appId: "1:38445222334:web:60abe27ff87fa86c25d1ef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
