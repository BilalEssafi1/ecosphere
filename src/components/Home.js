import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <div className={styles.Home}>
      <h1>Welcome to Ecosphere</h1>
      <div className={styles.Content}>
        <p>
          Your community hub for sustainable living! Share your eco-friendly journey,
          discover green initiatives, and connect with like-minded individuals.
        </p>

        <div className={styles.Features}>
          <p>Sign up to:</p>
          <ul>
            <li>Like and comment on inspiring sustainability posts</li>
            <li>Bookmark your favorite green ideas for later</li>
            <li>Follow eco-conscious creators</li>
            <li>Share your own sustainable living tips and experiences</li>
          </ul>
        </div>

        <p>Join us in building a greener future, one post at a time!</p>

        <div className={styles.ButtonContainer}>
          <Link to="/signup" className={`${styles.ViewPostsButton} ${styles.SignUpButton}`}>
            Sign Up
          </Link>
          <Link to="/posts" className={styles.ViewPostsButton}>
            View Posts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
