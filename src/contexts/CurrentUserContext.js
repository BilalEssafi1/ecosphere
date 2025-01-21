import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
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

  /**
   * Handle clean logout and cleanup of auth data
   */
  const handleCleanup = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    ['csrftoken', 'sessionid'].forEach(cookieName => {
      removeCookie(cookieName);
    });
    window.location.href = '/signin';
  }, []);

  /**
   * Handle logout - using exact same code as NavBar's handleSignOut
   */
  const handleLogout = useCallback(async () => {
    try {
      // Get CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

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

      // Clear user state and tokens
      setCurrentUser(null);
      removeTokenTimestamp();
      
      // Clear stored tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Clear specific authentication cookies
      ['csrftoken', 'sessionid'].forEach(cookieName => {
        removeCookie(cookieName);
      });

      // Redirect to signin page
      window.location.href = '/signin';
      
    } catch (err) {
      console.error('Logout failed:', err);
      // Attempt to clear cookies even if the logout request fails
      ['csrftoken', 'sessionid'].forEach(cookieName => {
        removeCookie(cookieName);
      });
    }
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
        refresh: refresh
      });
      
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch (err) {
      // If refresh fails, do a clean logout
      console.error('Token refresh failed:', err);
      handleCleanup();
      return null;
    }
  }, [handleCleanup]);

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
          try {
            const token = await refreshToken();
            if (token) {
              const config = err.config;
              config.headers.Authorization = `Bearer ${token}`;
              return axios(config);
            } else {
              // If refresh failed, ensure clean logout
              handleCleanup();
            }
          } catch (refreshErr) {
            // Ensure clean logout on any refresh error
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
