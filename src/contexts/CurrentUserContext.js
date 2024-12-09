import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

/**
 * Context to share the current user state across components
 */
export const CurrentUserContext = createContext();

/**
 * Context to share the function to update current user across components
 */
export const SetCurrentUserContext = createContext();

/**
 * Custom hook to access the current user data
 * @returns {object} The current user object
 */
export const useCurrentUser = () => useContext(CurrentUserContext);

/**
 * Custom hook to access the function that updates current user
 * @returns {Function} Function to update current user
 */
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

/**
 * Provider component that wraps the app to provide user authentication state
 * Handles:
 * - User authentication state
 * - Token refresh
 * - Automatic redirection on authentication failures
 * 
 */
export const CurrentUserProvider = ({ children }) => {
  // State to store the current logged-in user
  const [currentUser, setCurrentUser] = useState(null);
  
  // Router history for navigation
  const history = useHistory();

  /**
   * Fetches the current user data when component mounts
   */
  const handleMount = async () => {
    try {
      const { data } = await axios.get("dj-rest-auth/user/", {
        withCredentials: true
      });
      setCurrentUser(data);
    } catch (err) {
      console.log("Error fetching user:", err);
    }
  };

  // Run handleMount when component mounts
  useEffect(() => {
    handleMount();
  }, []);

  /**
   * Memoized interceptors for handling token refresh and authentication
   * Set up axios interceptors for both requests and responses
   */
  useMemo(() => {
    // Request interceptor
    axiosReq.interceptors.request.use(
      async (config) => {
        // Check if token refresh is needed
        if (shouldRefreshToken()) {
          try {
            // Attempt to refresh the token
            await axios.post("/dj-rest-auth/token/refresh/", {}, {
              withCredentials: true
            });
          } catch (err) {
            // If refresh fails, log out user and redirect to signin
            setCurrentUser((prevCurrentUser) => {
              if (prevCurrentUser) {
                history.push("/signin");
              }
              return null;
            });
            removeTokenTimestamp();
            return config;
          }
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Response interceptor
    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        // Handle 401 Unauthorized errors
        if (err.response?.status === 401) {
          try {
            // Attempt to refresh the token
            await axios.post("/dj-rest-auth/token/refresh/", {}, {
              withCredentials: true
            });
            // Retry the original request
            return axios(err.config);
          } catch (refreshError) {
            // If refresh fails, log out user and redirect to signin
            setCurrentUser((prevCurrentUser) => {
              if (prevCurrentUser) {
                history.push("/signin");
              }
              return null;
            });
            removeTokenTimestamp();
          }
        }
        return Promise.reject(err);
      }
    );
  }, [history]); // Only re-run if history changes

  return (
    // Provide current user value to all child components
    <CurrentUserContext.Provider value={currentUser}>
      {/* Provide setter function to all child components */}
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};
