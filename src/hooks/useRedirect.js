import axios from "axios";
import { useEffect } from "react";
import { useHistory } from "react-router";

/**
* Custom hook to handle authentication-based redirects
* Manages token refresh and user authentication status in different scenarios
*/
export const useRedirect = (userAuthStatus) => {
  const history = useHistory();

  useEffect(() => {
   /**
    * Primary handler for authentication flow and token management
    * Performs token refresh, cleanup, and appropriate redirects
    */
    const handleMount = async () => {
      try {
       // Retrieve existing refresh token from local storage
        const refreshToken = localStorage.getItem('refresh_token');
        
       // If no refresh token exists and user should be logged out, redirect
        if (!refreshToken) {
          if (userAuthStatus === "loggedOut") {
            history.push("/");
          }
          return;
        }

        try {
         // Attempt to refresh access token using refresh token
          const response = await axios.post("/dj-rest-auth/token/refresh/", 
            { refresh: refreshToken },
            { 
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

         // Store new access token if refresh is successful
          if (response.data?.access) {
            localStorage.setItem('access_token', response.data.access);
          }

          if (userAuthStatus === "loggedIn") {
            history.push("/");
          }
        } catch (refreshError) {
          // Comprehensive cleanup for stale authentication
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Aggressive cookie clearing across domains
          const domains = [
            window.location.hostname,
            '.herokuapp.com',
            document.domain
          ];

          domains.forEach(domain => {
            document.cookie.split(";").forEach((c) => {
              document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/;domain=${domain}`);
            });
          });

          // Additional cleanup for authentication-specific cookies
          const authCookies = [
            'csrftoken', 
            'sessionid', 
            'my-app-auth', 
            'my-refresh-token'
          ];

          authCookies.forEach(cookieName => {
            document.cookie = `${cookieName}=;expires=${new Date().toUTCString()};path=/`;
          });

          if (userAuthStatus === "loggedOut") {
            history.push("/");
          }
        }
      } catch (err) {
       // Log any unexpected errors during redirect process
        console.error("Redirect error:", err);
      }
    };

   // Execute authentication and redirect logic
    handleMount();
  }, [history, userAuthStatus]);
};

export default useRedirect;
