import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

// Create contexts for current user state
export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

// Custom hooks for accessing context
export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

/**
 * CurrentUserProvider Component
 * Manages authentication state and token refresh
 */
export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  /**
   * Fetches the current user data
   * Sets up proper error handling for authentication failures
   */
  const handleMount = async () => {
    try {
      const { data } = await axios.get("dj-rest-auth/user/", {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        }
      });
      setCurrentUser(data);
    } catch (err) {
      // Only log actual errors, not auth-related 401s
      if (err.response?.status !== 401) {
        console.log("Error fetching user:", err);
      }
    }
  };

  // Effect to fetch user data on mount
  useEffect(() => {
    // Only fetch if we don't have a current user
    if (!currentUser) {
      handleMount();
    }
  }, [currentUser]);

  /**
   * Sets up axios interceptors for handling token refresh
   * and authentication errors
   */
  useMemo(() => {
    // Request interceptor
    axiosReq.interceptors.request.use(
      async (config) => {
        try {
          if (shouldRefreshToken()) {
            await axios.post(
              "/dj-rest-auth/token/refresh/",
              {},
              {
                withCredentials: true,
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                }
              }
            );
          }
        } catch (err) {
          // Handle token refresh failure
          setCurrentUser(null);
          removeTokenTimestamp();
          history.push("/signin");
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
        if (err.response?.status === 401) {
          try {
            await axios.post(
              "/dj-rest-auth/token/refresh/",
              {},
              {
                withCredentials: true,
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                }
              }
            );
            // If refresh successful, retry the original request
            return axios(err.config);
          } catch (refreshErr) {
            // If refresh fails, clear user state and redirect
            setCurrentUser(null);
            removeTokenTimestamp();
            history.push("/signin");
          }
        }
        return Promise.reject(err);
      }
    );
  }, [history]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};
