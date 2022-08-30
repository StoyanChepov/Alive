import React, { useRef, useState, useEffect } from "react";
import useFacePositions from "../hooks/useFacePositions";
import { motion } from "framer-motion";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import useAllMatches from "../hooks/useAllMatches";

const Modal = ({ selectedImg, setSelectedImg }) => {
  const [updatedPersonName, setFriends] = useState([]);
  const imgRef = useRef();
  const canvasRef = useRef();
  const { faces } = useFacePositions(selectedImg.id);
  const { pos } = useAllMatches(selectedImg.id);

  const handleClick = (e) => {
    if (e.target.classList.contains("backdrop")) {
      setSelectedImg(null);
      setFriends(null);
    }
  };

  const enter = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 5;
    ctx.strokeStyle = "blue";
    faces.map((face) =>
      ctx.strokeRect(
        face.distanceLeft,
        face.distanceTop,
        face.length,
        face.width
      )
    );
  };

  function addFriend(face, event) {
    console.log("Update face ", face);
    if (event.key === "Enter" && event.target.value !== "") {
      console.log("Update name to ", event.target.value);
      setFriends({
        id: face.personId,
        faceUrl: face.faceUrl,
        newName: event.target.value,
      });
    }
  }

  useEffect(() => {
    const updatePersonName = () => {
      updateDoc(doc(db, "persons", updatedPersonName.id), {
        name: updatedPersonName.newName,
      });
      console.log('Pos:', pos);
      let fp = pos.filter(function (p) {
        return p.personId === 
         updatedPersonName.id;
      });
      for (let i = 0; i < fp.length; i++) {
        updateDoc(doc(db, "facePositions", fp[i].id), {
          fullName: updatedPersonName.newName
        });
      }
    };

    updatedPersonName &&
      pos &&
      updatedPersonName.id &&
      updatedPersonName.newName &&
      updatePersonName();
  }, [updatedPersonName]);

  return (
    <motion.div
      className="backdrop"
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.img
        ref={imgRef}
        className="backdrop"
        crossOrigin="anonymous"
        src={selectedImg.url}
        alt="enlarged pic"
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
      />
      <canvas
        className="backdrop"
        onMouseEnter={enter}
        ref={canvasRef}
        width={selectedImg.width}
        height={selectedImg.height}
      />
      {faces &&
        faces.map((face, i) => (
          <input
            name={`input${i}`}
            style={{
              left: face.distanceLeft,
              top: face.distanceTop + face.width + 5,
            }}
            placeholder={face.fullName === "" ? "Add name" : face.fullName}
            key={i}
            className="friendInput"
            onKeyPress={addFriend.bind(this, face)}
          />
        ))}
    </motion.div>
  );
};

export default Modal;
