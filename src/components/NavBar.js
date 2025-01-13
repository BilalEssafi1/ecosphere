import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import logo from "../assets/logo-ecosphere.jpg";
import styles from "../styles/NavBar.module.css";
import { NavLink } from "react-router-dom";
import {
  useCurrentUser,
  useSetCurrentUser,
} from "../contexts/CurrentUserContext";
import Avatar from "./Avatar";
import axios from "axios";
import useClickOutsideToggle from "../hooks/useClickOutsideToggle";
import { removeTokenTimestamp } from "../utils/utils";

const NavBar = () => {
  // Get current user and setter from context
  const currentUser = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();

  // Custom hook for handling navbar toggle on mobile
  const { expanded, setExpanded, ref } = useClickOutsideToggle();

  /**
   * Handles user sign out
   * - Sends a logout request to the backend with the CSRF token.
   * - Clears all relevant cookies and localStorage tokens.
   * - Redirects the user to the signin page after logout.
   */
  const handleSignOut = async () => {
    try {
      // Extract the CSRF token from cookies
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      // Make the logout request to the backend with the CSRF token
      await axios.post(
        "/dj-rest-auth/logout/",
        {},
        {
          withCredentials: true, // Include cookies with the request
          headers: {
            "X-CSRFToken": csrfToken, // CSRF token for authentication
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // Clear user state and authentication tokens
      setCurrentUser(null);
      removeTokenTimestamp();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Helper function to clear cookies
      const removeCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com; secure; samesite=none`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=none`;
      };

      // Remove all relevant cookies
      removeCookie("csrftoken");
      removeCookie("my-app-auth");
      removeCookie("my-refresh-token");
      removeCookie("sessionid");

      // Redirect the user to the signin page
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout failed:", err);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  // Add post icon - visible only when user is logged in
  const addPostIcon = (
    <NavLink
      className={styles.NavLink}
      activeClassName={styles.Active}
      to="/posts/create"
    >
      <i className="far fa-plus-square"></i>Add post
    </NavLink>
  );

  // Icons shown when the user is logged in
  const loggedInIcons = (
    <>
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/feed"
      >
        <i className="fas fa-stream"></i>Feed
      </NavLink>
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/liked"
      >
        <i className="fas fa-heart"></i>Liked
      </NavLink>
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/bookmarks"
      >
        <i className="fas fa-bookmark"></i>Bookmarks
      </NavLink>
      <NavLink className={styles.NavLink} to="/" onClick={handleSignOut}>
        <i className="fas fa-sign-out-alt"></i>Sign out
      </NavLink>
      <NavLink
        className={styles.NavLink}
        to={`/profiles/${currentUser?.profile_id}`}
      >
        <Avatar src={currentUser?.profile_image} text="Profile" height={40} />
      </NavLink>
    </>
  );

  // Icons shown when the user is logged out
  const loggedOutIcons = (
    <>
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/signin"
      >
        <i className="fas fa-sign-in-alt"></i>Sign in
      </NavLink>
      <NavLink
        to="/signup"
        className={styles.NavLink}
        activeClassName={styles.Active}
      >
        <i className="fas fa-user-plus"></i>Sign up
      </NavLink>
    </>
  );

  return (
    <Navbar
      expanded={expanded}
      className={styles.NavBar}
      expand="md"
      fixed="top"
    >
      <Container>
        <NavLink to="/">
          <Navbar.Brand>
            <img src={logo} alt="logo" height="45" />
          </Navbar.Brand>
        </NavLink>
        {currentUser && addPostIcon}
        <Navbar.Toggle
          ref={ref}
          onClick={() => setExpanded(!expanded)}
          aria-controls="basic-navbar-nav"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto text-left">
            <NavLink
              exact
              className={styles.NavLink}
              activeClassName={styles.Active}
              to="/"
            >
              <i className="fas fa-home"></i>Home
            </NavLink>

            {currentUser ? loggedInIcons : loggedOutIcons}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
