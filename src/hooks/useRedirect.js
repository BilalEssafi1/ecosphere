import axios from "axios";
import { useEffect } from "react";
import { useHistory } from "react-router";

/**
* Custom hook to handle authentication-based redirects
* Manages token refresh and user authentication status
*/
export const useRedirect = (userAuthStatus) => {
 const history = useHistory();

 useEffect(() => {
   /**
    * Handles component mount logic
    * Checks authentication status and manages token refresh
    */
   const handleMount = async () => {
     try {
       // Check for existing refresh token
       const refreshToken = localStorage.getItem('refresh_token');
       
       // Handle case when no refresh token exists
       if (!refreshToken) {
         if (userAuthStatus === "loggedOut") {
           history.push("/");
         }
         return;
       }

       // Attempt to refresh the access token
       const response = await axios.post("/dj-rest-auth/token/refresh/", {
         refresh: refreshToken
       }, {
         headers: {
           'Content-Type': 'application/json'
         }
       });

       // Store new access token if refresh was successful
       if (response.data?.access) {
         localStorage.setItem('access_token', response.data.access);
       }

       // Handle redirect for logged in users
       if (userAuthStatus === "loggedIn") {
         history.push("/");
       }
     } catch (err) {
       
       // Clear tokens if refresh failed
       if (err.response?.status === 401) {
         localStorage.removeItem('access_token');
         localStorage.removeItem('refresh_token');
       }

       // Redirect logged out users
       if (userAuthStatus === "loggedOut") {
         history.push("/");
       }
     }
   };

   // Execute mount handler
   handleMount();
 }, [history, userAuthStatus]); // Re-run effect if history or userAuthStatus changes
};

export default useRedirect;
