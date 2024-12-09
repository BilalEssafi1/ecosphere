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

  /**
   * Fetches current user data using stored token
   */
  const handleMount = async () => {
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
        console.log("Token expired or invalid, attempting refresh...");
        try {
          await refreshToken();
        } catch (refreshErr) {
          console.log("Token refresh failed, redirecting to login");
          handleLogout();
        }
      }
    }
  };

  /**
   * Handles token refresh
   */
  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      throw new Error("No refresh token available");
    }

    const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
      refresh: refresh
    });
    
    localStorage.setItem("access_token", data.access);
    return data.access;
  };

  /**
   * Handles user logout
   */
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    removeTokenTimestamp();
    history.push("/signin");
  };

  useEffect(() => {
    handleMount();
  }, []);

  useMemo(() => {
    // Request interceptor
    axiosReq.interceptors.request.use(
      async (config) => {
        let token = localStorage.getItem("access_token");

        if (shouldRefreshToken()) {
          try {
            token = await refreshToken();
          } catch (err) {
            handleLogout();
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

    // Response interceptor
    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          try {
            const token = await refreshToken();
            const config = err.config;
            config.headers.Authorization = `Bearer ${token}`;
            return axios(config);
          } catch (refreshErr) {
            handleLogout();
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