import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";

const Modal = ({ selectedImg, setSelectedImg }) => {
  const [faces, setFaces] = useState([]);
  const [friends, setFriends] = useState([]);
  const imgRef = useRef();

  const handleClick = (e) => {
    console.log("Backdrop", e.target.classList);
    if (e.target.classList.contains("backdrop")) {
      setSelectedImg(null);
      setFaces(null);
      setFriends(null);
    }
  };

  const canvasRef = useRef();

  const handleImage = async () => {
    console.log(imgRef.current);
    const detections = await faceapi.detectAllFaces(
      imgRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );
    setFaces(detections.map((d) => Object.values(d.box)));
  };

  const enter = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 5;
    ctx.strokeStyle = "yellow";
    console.log("faces", faces);
    faces.map((face) => ctx.strokeRect(...face));
  };

  useEffect(() => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ])
        .then(handleImage)
        .catch((e) => console.log(e));
    };
    imgRef.current && loadModels();
  }, []);

  function addFriend(event) {
    if (event.key == "Enter" && event.target.value != "") {
      console.log(event.target.value);
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
      {faces.map((face, i) => (
        <input
          name={`input${i}`}
          style={{ left: face[0], top: face[1] + face[3] + 5 }}
          placeholder="Tag a friend"
          key={i}
          className="friendInput"
          onKeyPress={addFriend}
        />
      ))}
    </motion.div>
  );
};

export default Modal;
