import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCOEnFHu7RZlL_ghkOiFOZWRyPbI7IIH9Y",
    authDomain: "iqplay-3c1c5.firebaseapp.com",
    projectId: "iqplay-3c1c5",
    storageBucket: "iqplay-3c1c5.firebasestorage.app",
    messagingSenderId: "801055464410",
    appId: "1:801055464410:web:ea40943596362371503ee3",
    measurementId: "G-J5Z9ZHKX5K"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, };
