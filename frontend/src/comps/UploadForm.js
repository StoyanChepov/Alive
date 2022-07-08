import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [image, setImage] = useState();

  const types = ["image/png", "image/jpeg"];

  useEffect(() => {
    const getImage = () => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      if (file && types.includes(file.type)) {
        img.onload = () => {
          setImage({
            file: file,
            width: img.width,
            height: img.height,
          });
        };
        setError("");
      } else {
        setFile(null);
        setError("Please select an image file (png or jpg)");
      }
    };

    file && getImage();
  }, [file]);

  return (
    <form>
      <label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <span>+</span>
      </label>
      <div className="output">
        {error && <div className="error">{error}</div>}
        {file && <div>{file.name}</div>}
        {image && file && (
          <ProgressBar image={image} setFile={setFile} />
        )}
      </div>
    </form>
  );
};

export default UploadForm;
