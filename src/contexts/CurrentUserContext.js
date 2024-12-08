import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";

// Contexts to share state and updater functions
export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

// Hooks for easier access to context
export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Stores the current logged-in user
  const history = useHistory(); // React Router's useHistory hook

  const handleMount = async () => {
    try {
      // Fetch the current logged-in user from the API
      const { data } = await axiosRes.get("dj-rest-auth/user/");
      setCurrentUser(data); // Set the user in state
    } catch (err) {
      console.log("Error fetching user:", err); // Log errors if the request fails
    }
  };

  // Run on component mount to fetch the current user
  useEffect(() => {
    handleMount();
  }, []);

  // Memoized interceptors for token handling
  useMemo(() => {
    // Add a request interceptor to refresh tokens if needed
    axiosReq.interceptors.request.use(
      async (config) => {
        try {
          // Attempt to refresh tokens
          await axios.post("/dj-rest-auth/token/refresh/", null, {
            withCredentials: true, // Ensures cookies are sent
          });
        } catch (err) {
          console.error("Token refresh failed:", err); // Log any token refresh errors
          setCurrentUser((prevUser) => {
            if (prevUser) {
              history.push("/signin"); // Redirect to sign-in if refresh fails
            }
            return null;
          });
          return config;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    // Add a response interceptor to handle 401 errors
    axiosRes.interceptors.response.use(
      (response) => response, // Pass through successful responses
      async (err) => {
        if (err.response?.status === 401) {
          try {
            // Refresh the token on 401 error
            await axios.post("/dj-rest-auth/token/refresh/", null, {
              withCredentials: true,
            });
            return axios(err.config); // Retry the failed request
          } catch (err) {
            console.error("Token refresh on 401 failed:", err);
            setCurrentUser((prevUser) => {
              if (prevUser) {
                history.push("/signin");
              }
              return null;
            });
          }
        }
        return Promise.reject(err); // Pass through other errors
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
