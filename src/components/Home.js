import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <div className={styles.Home}>
      <h1>Welcome to Ecosphere</h1>
      <p>
        Your community hub for sustainable living! Share your eco-friendly journey,
        discover green initiatives, and connect with like-minded individuals.
      </p>
      <p>
        Sign up to like and comment 
        on inspiring sustainability posts, bookmark your favorite green ideas, 
        follow eco-conscious creators, and share your own sustainable living tips.
      </p>
      <p>Join us in building a greener future, one post at a time!</p>
      <Link to="/posts" className={styles.ViewPostsButton}>
        View Posts
      </Link>
    </div>
  );
};

export default Home;
