import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

/**
 * Context for storing and accessing the current user data
 */
export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

/**
 * Provider component that wraps app to provide current user context
 */
export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  /**
   * Handle user logout and cleanup
   * Memoized to prevent recreation and fix dependency warnings
   */
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    removeTokenTimestamp();
    history.push("/signin");
  }, [history]);

  /**
   * Check token expiration and handle automatic logout
   */
  useEffect(() => {
    const checkTokenExpiration = () => {
      const tokenTimestamp = localStorage.getItem("refreshTokenTimestamp");
      if (tokenTimestamp) {
        const expirationTime = new Date(parseInt(tokenTimestamp) * 1000);
        const now = new Date();
        
        // Token has expired, perform logout
        if (expirationTime <= now) {
          handleLogout();
        }
      }
    };

    // Check token expiration every minute
    const intervalId = setInterval(checkTokenExpiration, 60000);
    
    // Initial check
    checkTokenExpiration();

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [handleLogout]);

  /**
   * Refresh access token using refresh token
   * Memoized to prevent recreation and fix dependency warnings
   */
  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        handleLogout();
        return null;
      }

      const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
        refresh: refresh
      });
      
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch (err) {
      handleLogout();
      return null;
    }
  }, [handleLogout]);

  /**
   * Fetch current user data using stored token
   * Memoized to prevent recreation and fix dependency warnings
   */
  const handleMount = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const { data } = await axios.get("/dj-rest-auth/user/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(data);
    } catch (err) {
      if (err.response?.status === 401) {
        await refreshToken();
      }
    }
  }, [refreshToken]);

  // Call handleMount on component mount
  useEffect(() => {
    handleMount();
  }, [handleMount]);

  // Set up axios interceptors
  useMemo(() => {
    // Request interceptor: add token to all requests if available
    axiosReq.interceptors.request.use(
      async (config) => {
        let token = localStorage.getItem("access_token");

        // Check if token needs to be refreshed
        if (shouldRefreshToken()) {
          token = await refreshToken();
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Response interceptor: handle token expiration
    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          const token = await refreshToken();
          if (token) {
            const config = err.config;
            config.headers.Authorization = `Bearer ${token}`;
            return axios(config);
          }
        }
        return Promise.reject(err);
      }
    );
  }, [refreshToken]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};

export default CurrentUserProvider;