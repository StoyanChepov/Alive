import { useState, useEffect } from "react";
import { db } from "../firebase/config";
// import * as canvas from "canvas";
import { setDoc, doc } from "firebase/firestore";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
// import * as faceapi from "face-api.js";

const useStorage = (image) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url] = useState(null);

  useEffect(() => {
    // references
console.log('FU', image);
    const storageSpace = getStorage();
    const imageRef = ref(storageSpace, image.file.name); // `/images/${image.name}`
    // const collectionRef = collection(db, "images");
    console.log('T ', image);
    const uploadImage = uploadBytesResumable(imageRef, image.file);
    uploadImage.on(
      "state_changed",
      (snap) => {
        let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(percentage);
      },
      (err) => {
        setError(err);
      },
      async () => {
        const url = await getDownloadURL(uploadImage.snapshot.ref);
        console.log("image available at", url);
        const createdAt = new Date().getTime();
        let width = image.width;
        let height = image.height;
        // let detections = await detectFaces(url);
        // console.log("final ", detections);
        // await collectionRef.add({ url, createdAt });
        await setDoc(doc(db, "images", image.file.name), { url, createdAt, width, height});
        //setUrl(url);
      }
    );
  }, [image]);

  return { progress, url, error };
};

export default useStorage;
