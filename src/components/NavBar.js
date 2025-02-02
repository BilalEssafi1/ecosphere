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


// Function to remove cookies with specific Heroku domain
const removeCookie = (name) => {
 // Target the specific herokuapp.com domain and its subdomain
 const cookieOptions = [
   // Root domain with specific path
   `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=drf-api-green-social-61be33473742.herokuapp.com`,
   // Handle the .herokuapp.com domain
   `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com`,
   // Without domain specification
   `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
   // With secure and SameSite attributes
   `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=drf-api-green-social-61be33473742.herokuapp.com; secure; samesite=none`,
   `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com; secure; samesite=none`
 ];


 // Apply all cookie deletion variants
 cookieOptions.forEach(option => {
   document.cookie = option;
 });
};


const NavBar = () => {
 // Get current user and setter from context
 const currentUser = useCurrentUser();
 const setCurrentUser = useSetCurrentUser();

 // Custom hook for handling navbar toggle on mobile
 const { expanded, setExpanded, ref } = useClickOutsideToggle();


 /**
  * Handles user sign out
  * Clears tokens, cookies, and user data
  * Ensures clean state for next login attempt
  */
 const handleSignOut = async () => {
   try {
     // Get CSRF token from cookies
     const csrfToken = document.cookie
       .split('; ')
       .find(row => row.startsWith('csrftoken='))
       ?.split('=')[1];


     // Make logout request with CSRF token
     await axios.post(
       "/dj-rest-auth/logout/",
       {},
       {
         withCredentials: true,
         headers: {
           'X-CSRFToken': csrfToken,
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         }
       }
     );


     // Clear user state and tokens
     setCurrentUser(null);
     removeTokenTimestamp();
    
     // Clear stored tokens
     localStorage.removeItem('access_token');
     localStorage.removeItem('refresh_token');


     // Clear specific authentication cookies
     ['csrftoken', 'sessionid'].forEach(cookieName => {
       removeCookie(cookieName);
     });


     // Force reload to signin page for clean state
     window.location.href = '/signin';
    
   } catch (err) {
     console.error('Logout failed:', err);
     // Attempt to clear cookies even if the logout request fails
     ['csrftoken', 'sessionid'].forEach(cookieName => {
       removeCookie(cookieName);
     });
   }
 };

 // Add post icon - shows only when user is logged in
 const addPostIcon = (
   <NavLink
     className={styles.NavLink}
     activeClassName={styles.Active}
     to="/posts/create"
   >
     <i className="far fa-plus-square"></i>Add post
   </NavLink>
 );

 // Icons shown when user is logged in
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
     {/* Add Bookmarks NavLink */}
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

 // Icons shown when user is logged out
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
           <NavLink
             className={styles.NavLink}
             activeClassName={styles.Active}
             to="/posts"
           >
             <i className="fas fa-list"></i>Posts
           </NavLink>

           {currentUser ? loggedInIcons : loggedOutIcons}
         </Nav>
       </Navbar.Collapse>
     </Container>
   </Navbar>
 );
};

export default NavBar;
