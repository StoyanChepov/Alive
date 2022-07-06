import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import * as faceapi from "face-api.js";
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

  const handleImage = async () => {
    const img = new Image();
    img.src = URL.createObjectURL(image.file);
    
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  
    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.TinyFaceDetectorOptions()
    );
    return detections.map((d) => Object.values(d.box));
  };

  useEffect(() => {
    // references
    const storageSpace = getStorage();
    const imageRef = ref(storageSpace, image.file.name); // `/images/${image.name}`
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
        const createdAt = new Date().getTime();
        let width = image.width;
        let height = image.height;

        await setDoc(doc(db, "images", image.file.name), {
          url,
          createdAt,
          width,
          height,
        });
        
        
        let detections = await handleImage();
        for (let index = 0; index < detections.length; index++) {
          await setDoc(doc(db, "facePositions", image.file.name + '-' + index), {
            distanceLeft: detections[index][0],
            distanceTop: detections[index][1],
            length: detections[index][2],
            width: detections[index][3],
            createdAt,
            imageId: image.file.name
          });
        }

        
        // await collectionRef.add({ url, createdAt });

        //setUrl(url);
      }
    );
  }, [image]);

  return { progress, url, error };
};

export default useStorage;
