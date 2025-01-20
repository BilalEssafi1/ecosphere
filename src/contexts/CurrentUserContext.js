import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

// Function to remove cookies with specific Heroku domain
const removeCookie = (name) => {
  // Target the specific herokuapp.com domain and its subdomain
  const cookieOptions = [
    // Root domain with specific path
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=drf-api-green-social-61be33473742.herokuapp.com`,
    // Handle the .herokuapp.com domain
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com`,
    // Without domain specification
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
    // With secure and SameSite attributes
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=drf-api-green-social-61be33473742.herokuapp.com; secure; samesite=none`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com; secure; samesite=none`
  ];

  // Apply all cookie deletion variants
  cookieOptions.forEach(option => {
    document.cookie = option;
  });

  // Log cookies for debugging purposes
  console.log('Cookies after removal:', document.cookie);
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
   * Handle logout - using exact same code as NavBar's handleSignOut
   */
  const handleLogout = useCallback(async () => {
    console.log("Logging out...");
    try {
      // Get CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      if (!csrfToken) {
        console.error("CSRF token is missing.");
      }

      // Make logout request with CSRF token
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

      // Clear user state
      setCurrentUser(null);
      removeTokenTimestamp();

      // Clear ALL stored data
      localStorage.clear();

      // Clear specific authentication cookies
      ['csrftoken', 'sessionid'].forEach(cookieName => {
        removeCookie(cookieName);
      });

      // Redirect to signin page without causing a loop
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      // Always clear cookies and local storage as a fallback
      setCurrentUser(null);
      removeTokenTimestamp();
      localStorage.clear();
      ['csrftoken', 'sessionid'].forEach(cookieName => {
        removeCookie(cookieName);
      });

      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
    }
  }, []);

  /**
   * Check session timeout and handle automatic logout
   */
  useEffect(() => {
    const checkSessionTimeout = async () => {
      const sessionStart = localStorage.getItem("session_start");
      if (sessionStart) {
        const sessionStartTime = parseInt(sessionStart, 10);
        const currentTime = new Date().getTime();
        
        // Check if session has exceeded timeout duration
        if (currentTime - sessionStartTime >= SESSION_TIMEOUT) {
          console.log("Session timeout - logging out");
          await handleLogout(); // Ensure proper async handling
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
        console.error("No refresh token found. Logging out.");
        await handleLogout();
        return null;
      }

      const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
        refresh: refresh
      });
      
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch (err) {
      console.error("Failed to refresh token. Logging out.", err);
      await handleLogout();
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
        console.warn("Access token expired. Refreshing token...");
        await refreshToken();
      } else {
        console.error("Failed to fetch user data:", err);
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
          console.warn("Unauthorized response. Attempting token refresh...");
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
