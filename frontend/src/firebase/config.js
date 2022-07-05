import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2D-DvAAG88M3OkcAfsBTVOEgf0CVqD4E",
  authDomain: "image-gallery-90dd1.firebaseapp.com",
  projectId: "image-gallery-90dd1",
  storageBucket: "image-gallery-90dd1.appspot.com",
  messagingSenderId: "555600352265",
  appId: "1:555600352265:web:beff715bc3ba9bd334d4d8",
  measurementId: "G-H4D3Q2PQVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const projectStorage = firebase.storage();
// const projectFirestore = firebase.firestore();
// const timestamp = firebase.firestore.FieldValue.serverTimestamp;
