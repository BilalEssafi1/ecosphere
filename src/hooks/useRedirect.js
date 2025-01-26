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
    const clearAllCookies = () => {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; SameSite=None; Secure`;
      }
    };

    const handleMount = async () => {
      try {
       // Retrieve existing refresh token from local storage
        const refreshToken = localStorage.getItem('refresh_token');
        
       // If no refresh token exists and user should be logged out, redirect
        if (!refreshToken) {
          clearAllCookies();
          localStorage.clear();
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

          if (!response.data?.access) {
            clearAllCookies();
            localStorage.clear();
            history.push("/signin");
          }
        } catch (refreshError) {
          clearAllCookies();
          localStorage.clear();
          history.push("/signin");
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
