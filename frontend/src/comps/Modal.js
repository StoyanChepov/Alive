import React, { useRef, useState } from "react";
import useFacePositions from "../hooks/useFacePositions";
import { motion } from "framer-motion";

const Modal = ({ selectedImg, setSelectedImg }) => {
  const [friends, setFriends] = useState([]);
  const imgRef = useRef();
  const canvasRef = useRef();
  const { faces } = useFacePositions(selectedImg.id);
  
  const handleClick = (e) => {
    if (e.target.classList.contains("backdrop")) {
      setSelectedImg(null);
      setFriends(null);
    }
  };

  const enter = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 5;
    ctx.strokeStyle = "red";
    faces.map((face) => ctx.strokeRect(face.distanceLeft, face.distanceTop, face.length, face.width));
  };

  function addFriend(event) {
    if (event.key === "Enter" && event.target.value !== "") {
      setFriends(event.target.value);
    }
  }

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
            placeholder= {face.personId}
            key={i}
            className="friendInput"
            onKeyPress={addFriend}
          />
        ))}
    </motion.div>
  );
};

export default Modal;
