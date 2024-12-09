import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  // Fetch current user data using stored token
  const handleMount = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const { data } = await axios.get("/dj-rest-auth/user/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(data);  // Set the current user if the token is valid
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("Token expired or invalid, attempting refresh...");
        try {
          await refreshToken();
        } catch (refreshErr) {
          console.log("Token refresh failed, redirecting to login");
          handleLogout();  // Log out if token refresh fails
        }
      }
    }
  };

  // Refresh access token using refresh token
  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      throw new Error("No refresh token available");
    }

    const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
      refresh: refresh
    });

    localStorage.setItem("access_token", data.access); // Save new access token
    return data.access;
  };

  // Handle user logout and cleanup
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    removeTokenTimestamp();
    history.push("/signin"); // Redirect to the login page
  };

  useEffect(() => {
    handleMount();  // Call handleMount on component mount
  }, []);  // Run only once when the component mounts

  useMemo(() => {
    // Request interceptor: add token to all requests if available
    axiosReq.interceptors.request.use(
      async (config) => {
        let token = localStorage.getItem("access_token");

        // Check if token needs to be refreshed
        if (shouldRefreshToken()) {
          try {
            token = await refreshToken();  // Attempt token refresh
          } catch (err) {
            handleLogout();  // Log out if refresh fails
            return Promise.reject(err);
          }
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
      (response) => response,  // If no error, just return the response
      async (err) => {
        if (err.response?.status === 401) {
          try {
            const token = await refreshToken();  // Refresh token if expired
            const config = err.config;
            config.headers.Authorization = `Bearer ${token}`;
            return axios(config);  // Retry the request with new token
          } catch (refreshErr) {
            handleLogout();  // Log out if refresh fails
          }
        }
        return Promise.reject(err);  // Reject other errors
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