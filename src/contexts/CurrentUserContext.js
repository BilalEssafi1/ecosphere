import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

// Create contexts for current user data and setter function
export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

// Custom hooks for easier context consumption
export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

/**
 * CurrentUserProvider Component
 * Provides authentication state and methods to child components
 * Handles token refresh and authentication error scenarios
 */
export const CurrentUserProvider = ({ children }) => {
  // State to store current user data
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  /**
   * Memoized callback for updating user state
   * Prevents unnecessary re-renders and state update issues
   */
  const handleCurrentUser = useCallback((user) => {
    setCurrentUser(user);
  }, []);

  /**
   * Fetches current user data on component mount
   * Sets initial authentication state
   */
  const handleMount = async () => {
    try {
      const { data } = await axios.get("dj-rest-auth/user/", {
        withCredentials: true
      });
      handleCurrentUser(data);
    } catch (err) {
      console.log(err);
    }
  };

  // Initialize user data on mount
  useEffect(() => {
    handleMount();
  }, []);

  /**
   * Set up axios interceptors for handling token refresh
   * Uses useMemo to prevent unnecessary recreation of interceptors
   */
  useMemo(() => {
    // Request interceptor - handles token refresh before requests
    axiosReq.interceptors.request.use(
      async (config) => {
        if (shouldRefreshToken()) {
          try {
            await axios.post("/dj-rest-auth/token/refresh/", {}, {
              withCredentials: true
            });
          } catch (err) {
            // Handle refresh failure outside of render cycle
            setTimeout(() => {
              handleCurrentUser(null);
              removeTokenTimestamp();
              history.push("/signin");
            }, 0);
          }
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Response interceptor - handles 401 errors
    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          try {
            await axios.post("/dj-rest-auth/token/refresh/", {}, {
              withCredentials: true
            });
            return axios(err.config);
          } catch (err) {
            // Handle refresh failure outside of render cycle
            setTimeout(() => {
              handleCurrentUser(null);
              removeTokenTimestamp();
              history.push("/signin");
            }, 0);
          }
        }
        return Promise.reject(err);
      }
    );
  }, [history, handleCurrentUser]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={handleCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};

