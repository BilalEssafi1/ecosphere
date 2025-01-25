import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
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
   * Handle clean logout and cleanup of auth data
   */
  const handleCleanup = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear all cookies as a fallback for complete cleanup
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    });

    // Keep the user on the homepage instead of redirecting to the sign-in page
  }, []);

  /**
   * Refresh access token using refresh token
   * Handles token expiration with proper cleanup
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
        refresh: refresh,
      });
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch (err) {
      // If token refresh fails, clean up the session
      console.error("Token refresh failed:", err);
      handleCleanup();
      return null;
    }
  }, [handleCleanup]);

  /**
   * Fetch current user data using the stored token
   * Handles session validation on app mount
   */
  const handleMount = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const hasAuthCookie = document.cookie.includes("my-app-auth");

      // If no valid tokens or cookies, attempt a silent refresh before cleanup
      if (!accessToken || !refreshToken || !hasAuthCookie) {
        const refreshedToken = await refreshToken();
        if (!refreshedToken) {
          handleCleanup();
          return;
        }
      }

      // Attempt to validate and fetch the current user
      const { data } = await axios.get("/dj-rest-auth/user/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setCurrentUser(data); // Set the authenticated user
    } catch (err) {
      // Cleanup if validation fails
      console.error("Error during user validation:", err);
      handleCleanup();
    }
  }, [handleCleanup, refreshToken]);

  // Call handleMount on component mount to validate the session
  useEffect(() => {
    handleMount();
  }, [handleMount]);

  // Set up axios interceptors for handling tokens
  useMemo(() => {
    // Request interceptor: add token to outgoing requests if available
    axiosReq.interceptors.request.use(
      async (config) => {
        let token = localStorage.getItem("access_token");
        // Check if the token needs to be refreshed
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
            const refreshedToken = await refreshToken();
            if (refreshedToken) {
              const config = err.config;
              config.headers.Authorization = `Bearer ${refreshedToken}`;
              return axios(config);
            }
          } catch (refreshErr) {
            console.error("Token refresh error:", refreshErr);
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
