// src/lib/firebase.js
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBTOG8B9uCzrXMTrT_k65URocOs3VmYlFE",
  authDomain: "jira-clone-d5c1d.firebaseapp.com",
  projectId: "jira-clone-d5c1d",
  storageBucket: "jira-clone-d5c1d.firebasestorage.app",
  messagingSenderId: "268849710588",
  appId: "1:268849710588:web:c1e4cfb195710485465e79"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
