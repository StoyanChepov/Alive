import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import * as faceapi from "face-api.js";
import { collection, setDoc, doc, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
} from "firebase/storage";
// import * as faceapi from "face-api.js";

const useStorage = (image) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url] = useState(null);

  function loadLabeledImages(persons) {
    return Promise.all(
      persons.map(async (label) => {
        const queryImage = label.faceUrl;
        const descriptions = [];
        const img = await faceapi.fetchImage(queryImage);
        const results2 = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(results2.descriptor);
        return new faceapi.LabeledFaceDescriptors(
          label.personId.concat("$", label.name),
          descriptions
        );
      })
    );
  }

  async function extractFaceFromBox(imageRef, box) {
    const regionsToExtract = [new faceapi.Rect(box[0], box[1], box[2], box[3])];

    let faceImages = await faceapi.extractFaces(imageRef, regionsToExtract);

    if (faceImages.length === 0) {
      console.log("No face found");
      return "";
    } else {
      console.log("Match", faceImages);
      const outputImage = new Image();
      for (let index = 0; index < faceImages.length; index++) {
        console.log(faceImages[index].toDataURL());
        outputImage.src = faceImages[index].toDataURL();
      }

      const storage = getStorage();
      let uuid = uuidv4();
      const storageRef = ref(storage, uuid);

      // Data URL string
      await uploadString(storageRef, outputImage.src, "data_url");
      return await getDownloadURL(ref(storage, uuid));
    }
  }

  const findMatches = async (persons) => {
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");

    /*reference image*/
    const referenceImage = new Image();
    referenceImage.src = URL.createObjectURL(image.file);

    const resul = await faceapi
      .detectAllFaces(referenceImage)
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (!resul.length) {
      return;
    }
    let faceMatcher;
    if (persons.length !== 0) {
      console.log('i go here');
      let labeledFaces = await loadLabeledImages(persons);
      console.log("Labeled Faces ", labeledFaces);
      faceMatcher = new faceapi.FaceMatcher(labeledFaces, 0.6);
    }
    const container = document.createElement("div");
    let testImage = await faceapi.bufferToImage(image.file);
    container.append(testImage);
    let canvas = faceapi.createCanvasFromMedia(testImage);
    container.append(canvas);
    const displaySize = { width: testImage.width, height: testImage.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(testImage)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    return resizedDetections.map((d) => ({
      match: faceMatcher
        ? faceMatcher.findBestMatch(d.descriptor)
        : { label: "$unknown" },
      shape: Object.values(d.detection.box),
      personId: "",
    }));
  };
  /*
  const findFaceDetections = async () => {
    const img = new Image();
    img.src = URL.createObjectURL(image.file);

    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.TinyFaceDetectorOptions()
    );
    return detections.map((d) => Object.values(d.box));
  };
*/
  const getPersons = async () => {
    let persons = [];
    const querySnapshot = await getDocs(collection(db, "persons"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      persons.push({ ...doc.data(), id: doc.id });
    });
    return persons;
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
          name: image.file.name,
          url,
          createdAt,
          width,
          height,
        });

        //let detections = await findFaceDetections();
        let persons = await getPersons();
        let detections = await findMatches(persons);
        console.log("Det", detections);
        const img = new Image();
        img.src = URL.createObjectURL(image.file);
        for (let index = 0; index < detections.length; index++) {
          const personLabel = detections[index].match.label;
          detections[index].fullName = '';
          if (personLabel === "unknown" || personLabel.split("$")[1] === "unknown") {
            let data = await extractFaceFromBox(img, detections[index].shape);
            let uuid = uuidv4();
            detections[index].personId = uuid;
            await setDoc(doc(db, "persons", uuid), {
              faceUrl: data,
              personId: uuid,
              name: "",
            });
          } else {
            detections[index].personId = personLabel.split("$")[0];
            detections[index].fullName = personLabel.split("$")[1];
          }
        }

        for (let index = 0; index < detections.length; index++) {
          console.log('detloop', detections[index]);
          await setDoc(
            doc(db, "facePositions", image.file.name + "-" + index),
            {
              distanceLeft: detections[index].shape[0],
              distanceTop: detections[index].shape[1],
              length: detections[index].shape[2],
              width: detections[index].shape[3],
              createdAt,
              imageId: image.file.name,
              personId: detections[index].personId,
              fullName: detections[index].fullName
            }
          );
        }
      }
    );
  }, [image]);

  return { progress, url, error };
};

export default useStorage;
