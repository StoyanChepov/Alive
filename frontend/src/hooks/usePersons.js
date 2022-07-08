import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { onSnapshot, collection, query } from "firebase/firestore";

const usePersons = () => {
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'persons'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ ...doc.data(), id: doc.id });
        });
        setPersons(documents);
      });
  
      return () => unsubscribe();
    }, []);
  return { persons };
};

export default usePersons;
