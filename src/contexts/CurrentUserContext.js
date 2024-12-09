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

  const handleMount = async () => {
    try {
      const { data } = await axios.get("/dj-rest-auth/user/", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setCurrentUser(data);
    } catch (err) {
      console.log("User fetch error:", err.response?.status, err.response?.data);
    }
  };

  useEffect(() => {
    handleMount();
  }, []);

  useMemo(() => {
    axiosReq.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (shouldRefreshToken()) {
          try {
            const { data } = await axios.post(
              "/dj-rest-auth/token/refresh/",
              {},
              { withCredentials: true }
            );
            localStorage.setItem("access_token", data.access);
          } catch (err) {
            setCurrentUser(null);
            removeTokenTimestamp();
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            history.push("/signin");
          }
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          try {
            const { data } = await axios.post(
              "/dj-rest-auth/token/refresh/",
              {},
              { withCredentials: true }
            );
            localStorage.setItem("access_token", data.access);
            const config = err.config;
            config.headers.Authorization = `Bearer ${data.access}`;
            return axios(config);
          } catch (err) {
            setCurrentUser(null);
            removeTokenTimestamp();
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
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