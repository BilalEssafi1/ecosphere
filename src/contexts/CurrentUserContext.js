import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

/**
 * Thorough cookie cleanup for all possible domains and paths
 */
const clearAllCookies = () => {
  const cookiesToClear = [
    'csrftoken',
    'sessionid',
    'my-app-auth',
    'my-refresh-token'
  ];

  const domains = [
    '', // no domain
    'drf-api-green-social-61be33473742.herokuapp.com',
    '.herokuapp.com',
    'localhost'
  ];

  const paths = ['/', '/api', ''];

  cookiesToClear.forEach(cookieName => {
    // Clear for each combination of domain and path
    domains.forEach(domain => {
      paths.forEach(path => {
        // Basic cookie clear
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}`;
        
        // Secure version
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}; secure`;
        
        // SameSite versions
        ['Strict', 'Lax', 'None'].forEach(sameSite => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}; SameSite=${sameSite}${sameSite === 'None' ? '; Secure' : ''}`;
        });
      });
    });
  });
};

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

  // Set session timeout to 5 Minutes
  const SESSION_TIMEOUT = 5 * 60 * 1000;

  /**
   * Complete logout function that handles both manual and automatic logout
   * Includes thorough cleanup of all auth-related data
   */
  const handleLogout = useCallback(async () => {
    try {
      // Get CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      // Make logout request with CSRF token if it exists
      if (csrfToken) {
        try {
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
        } catch (err) {
          console.error("Logout request failed:", err);
        }
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear user state and tokens
      setCurrentUser(null);
      
      // Remove stored tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("session_start");
      removeTokenTimestamp();

      // Clear all cookies thoroughly
      clearAllCookies();

      // Short delay before redirect to ensure cookies are cleared
      setTimeout(() => {
        // Force a complete page reload to ensure clean state
        window.location.href = '/signin';
      }, 100);
    }
  }, []);

  /**
   * Check session timeout and handle automatic logout
   */
  useEffect(() => {
    const checkSessionTimeout = () => {
      const sessionStart = localStorage.getItem("session_start");
      if (sessionStart) {
        const sessionStartTime = parseInt(sessionStart);
        const currentTime = new Date().getTime();
        
        // Check if session has exceeded timeout duration
        if (currentTime - sessionStartTime >= SESSION_TIMEOUT) {
          console.log("Session timeout - logging out");
          handleLogout();
        }
      }
    };

    // Set initial session start time if not exists
    if (!localStorage.getItem("session_start") && currentUser) {
      localStorage.setItem("session_start", new Date().getTime().toString());
    }

    // Check session timeout every minute
    const intervalId = setInterval(checkSessionTimeout, 60000);
    
    // Initial check
    checkSessionTimeout();

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [handleLogout, SESSION_TIMEOUT, currentUser]);

  /**
   * Refresh access token using refresh token
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
