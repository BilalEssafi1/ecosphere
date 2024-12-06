import React from "react";
import styles from "../styles/Avatar.module.css";

const Avatar = ({ src, height = 50, text }) => {

  return (
    <span>
      <img
        className={styles.Avatar}
        src={src || defaultImage}
        height={height}
        width={height}
        alt="avatar"
        onError={(e) => {
          e.target.onerror = null;  // Prevent infinite loop
          e.target.src = defaultImage;
        }}
      />
      {text}
    </span>
  );
};

export default Avatar;