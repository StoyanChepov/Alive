import React from "react";
import useFirestore from "../hooks/useFirestore";
import { motion } from "framer-motion";

const ImageGrid = ({ setSelectedImg }) => {
  const { docs } = useFirestore("images");

  return (
    <ul className="img-container">
      {docs &&
        docs.map((doc) => (
          <motion.li
            className="img-item"
            key={doc.id}
            layout
 
            whileHover={{ opacity: 1 }}
            s
            onClick={() => setSelectedImg(doc)}
          >
            <motion.img
              className="mot-img"
              src={doc.url}
              width={doc.width/2}
              height={doc.height/2}
              alt="uploaded pic"
              crossOrigin='anonymous'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            />
            <canvas
              width={doc.width/2}
              height={doc.height/2}
            />
          </motion.li>
        ))}
    </ul>
  );
};

export default ImageGrid;
