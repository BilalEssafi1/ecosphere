import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

// Utility function for cookie cleanup
export const clearAuthCookies = () => {
  const removeCookie = (name, domain, path) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=${path}`;
  };

  // Get base domain (e.g., herokuapp.com from subdomain.herokuapp.com)
  const domain = window.location.hostname;
  const baseDomain = domain.split('.').slice(-2).join('.');

  // List of all possible auth cookies
  const cookieNames = [
    'csrftoken',
    'sessionid',
    'my-app-auth',
    'my-refresh-token',
    'message',
    'messages'
  ];

  // List of domains to try
  const domains = [
    domain,
    `.${domain}`,
    baseDomain,
    `.${baseDomain}`,
    ''
  ];

  // List of paths to try
  const paths = ['/', '/api', '', '*'];

  console.log('Starting cookie cleanup...');
  console.log('Current cookies:', document.cookie);

  // Try all combinations
  cookieNames.forEach(cookieName => {
    domains.forEach(d => {
      paths.forEach(p => {
        removeCookie(cookieName, d, p);
      });
    });
  });

  // Also try without domain/path specifications
  cookieNames.forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  });

  console.log('Cookies after cleanup:', document.cookie);
};

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const handleCleanup = useCallback(() => {
    console.log('Running handleCleanup...');
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    removeTokenTimestamp();
    clearAuthCookies();

    // Force a reload of the application state
    window.location.replace('/signin');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post("/dj-rest-auth/logout/", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      handleCleanup();
    }
  }, [handleCleanup]);

  useEffect(() => {
    // Effect to mount token refresh interceptor
    const mountInterceptors = () => {
      const requestInterceptor = axiosReq.interceptors.request.use(
        async (config) => {
          try {
            if (shouldRefreshToken()) {
              const refreshToken = localStorage.getItem("refresh_token");
              if (!refreshToken) {
                handleCleanup();
                return config;
              }

              const response = await axios.post("/dj-rest-auth/token/refresh/", {
                refresh: refreshToken
              });
              localStorage.setItem("access_token", response.data.access);
            }
          } catch (err) {
            handleCleanup();
            return config;
          }

          const token = localStorage.getItem("access_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (err) => {
          return Promise.reject(err);
        }
      );

      const responseInterceptor = axiosRes.interceptors.response.use(
        (response) => response,
        async (err) => {
          if (err.response?.status === 401) {
            handleCleanup();
          }
          return Promise.reject(err);
        }
      );

      // Return cleanup function
      return () => {
        axiosReq.interceptors.request.eject(requestInterceptor);
        axiosRes.interceptors.response.eject(responseInterceptor);
      };
    };

    // Mount interceptors and get cleanup function
    const cleanup = mountInterceptors();

    // Return cleanup function for useEffect
    return () => {
      if (cleanup) cleanup();
    };
  }, [handleCleanup]);

  // Check for existing token and fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const { data } = await axios.get("/dj-rest-auth/user/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(data);
        }
      } catch (err) {
        handleCleanup();
      }
    };

    fetchUser();
  }, [handleCleanup]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={{ setCurrentUser, handleLogout, handleCleanup }}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};

export default CurrentUserProvider;
