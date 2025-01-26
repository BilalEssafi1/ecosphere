import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";
import Cookies from 'js-cookie';

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
   * Enhanced cleanup function to handle all auth state
   * Cleans up tokens, cookies, and user state across domains
   * Handles both local development and production environments
   */
  const handleCleanup = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    removeTokenTimestamp();
    
    // Clear all cookies with multiple domain variants
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Handle different domain scenarios and security attributes
      const cookieOptions = [
        // Base path clearing
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
        // Current domain
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`,
        // Heroku domain
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com`,
        // Secure cookie clearing
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=none`,
      ];

      cookieOptions.forEach(option => {
        document.cookie = option;
      });
    }

    history.push('/signin');
  }, [history]);

  /**
   * Enhanced token refresh with improved error handling
   * Includes CSRF token in refresh request
   * Handles token refresh failures gracefully
   */
  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        // Clean logout if no refresh token
        handleCleanup();
        return null;
      }
      
      const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
        refresh: refresh
      }, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch (err) {
      console.error('Token refresh failed:', err);
      handleCleanup();
      return null;
    }
  }, [handleCleanup]);

  /**
   * Fetch current user data using stored token
   * Handles token validation and auth state
   */
  const handleMount = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const hasAuthCookie = document.cookie.includes('my-app-auth');

      // Clear state if no valid tokens or cookies exist
      if (!token || !refreshToken || !hasAuthCookie) {
        setCurrentUser(null);
        return;
      }

      // Validate current user with token
      const { data } = await axios.get("/dj-rest-auth/user/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(data);
    } catch (err) {
      setCurrentUser(null);
    }
  }, []);

  // Call handleMount on component mount
  useEffect(() => {
    handleMount();
  }, [handleMount]);

  // Set up axios interceptors for request/response handling
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
          try {
            const token = await refreshToken();
            if (token) {
              const config = err.config;
              config.headers.Authorization = `Bearer ${token}`;
              return axios(config);
            } else {
              handleCleanup();
            }
          } catch (refreshErr) {
            console.error('Token refresh error:', refreshErr);
            handleCleanup();
          }
        }
        return Promise.reject(err);
      }
    );
  }, [refreshToken, handleCleanup]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};

export default CurrentUserProvider;
