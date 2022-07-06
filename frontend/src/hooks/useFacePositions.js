import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collectionGroup, onSnapshot, collection, query, orderBy, where } from "firebase/firestore";

const useFacePositions = (imageId) => {
  const [faces, setfacePos] = useState([]);

  useEffect(() => {
    console.log('ID: ', imageId);
    const q = query(collection(db, 'facePositions'), where('imageId', '==', imageId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ ...doc.data(), id: doc.id });
        });
        setfacePos(documents);
      });
  
      return () => unsubscribe();
    }, [imageId]);
  return { faces };
};

export default useFacePositions;
