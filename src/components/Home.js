import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <div className={styles.Home}>
      <h1>Welcome to Ecosphere</h1>
      <p>
        A platform for sustainable living where you can share, bookmark, and explore ideas for a greener world.
      </p>
      <Link to="/posts" className={styles.ViewPostsButton}>
        View Posts
      </Link>
    </div>
  );
};

export default Home;
