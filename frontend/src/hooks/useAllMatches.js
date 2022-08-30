import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { onSnapshot, collection, query } from "firebase/firestore";

const useAllMatches = (personId) => {
  const [pos, setPos] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'facePositions'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ ...doc.data(), id: doc.id });
        });
        console.log('Doc', documents);
        setPos(documents);
      });
  
      return () => unsubscribe();
    }, [personId]);
  return { pos };
};

export default useAllMatches;
