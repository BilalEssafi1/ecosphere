import React from "react";
import styles from "../styles/Avatar.module.css";

const Avatar = ({ src, height = 50, text }) => {
  return (
    <span>
      {src ? (
        <img
          className={styles.Avatar}
          src={src}
          height={height}
          width={height}
          alt="avatar"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.style.display = "none"; // Hide image on error
          }}
        />
      ) : (
        <span className={styles.NoAvatar}>{text || "No Image Available"}</span>
      )}
    </span>
  );
};

export default Avatar;
