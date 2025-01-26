import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";
import Cookies from 'js-cookie';

/**
 * Context for storing and accessing the current user data
 */
export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

// Hooks for accessing contexts
export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

/**
 * Provider component that wraps app to provide current user context
 */
export const CurrentUserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const history = useHistory();

  /**
   * Enhanced cleanup function to handle all auth state
   * Cleans up tokens, cookies, and user state across domains
   * Handles both local development and production environments
   */
    const handleCleanup = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        removeTokenTimestamp();

        const cookieOptions = [
            'path=/',
            'expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'domain=.herokuapp.com',
            'samesite=lax',
        ].join(';');

        document.cookie = `my-app-auth=;${cookieOptions}`;
        document.cookie = `my-refresh-token=;${cookieOptions}`;
        document.cookie = `csrftoken=;${cookieOptions}`;
        document.cookie = `sessionid=;${cookieOptions}`;

        history.push('/signin');
    }, [history]);

  /**
   * Enhanced token refresh with improved error handling
   * Includes CSRF token in refresh request
   * Handles token refresh failures gracefully
   */
    const refreshToken = useCallback(async () => {
        try {
            const refresh = localStorage.getItem("refresh_token");
            if (!refresh) {
        // Clean logout if no refresh token
                handleCleanup();
                return null;
            }

            const { data } = await axios.post("/dj-rest-auth/token/refresh/", { refresh }, {
                withCredentials: true,
                headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
            });

            localStorage.setItem("access_token", data.access);
            return data.access;
        } catch (err) {
            console.error('Token refresh failed:', err);
            handleCleanup();
            return null;
        }
    }, [handleCleanup]);

    // Axios interceptors for managing requests and responses
    useEffect(() => {
        const requestInterceptor = axiosReq.interceptors.request.use(
            async (config) => {
                if (shouldRefreshToken()) {
                    await refreshToken();
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axiosRes.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleCleanup();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosReq.interceptors.request.eject(requestInterceptor);
            axiosRes.interceptors.response.eject(responseInterceptor);
        };
    }, [handleCleanup, refreshToken]);

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <SetCurrentUserContext.Provider value={setCurrentUser}>
                {children}
            </SetCurrentUserContext.Provider>
        </CurrentUserContext.Provider>
    );
};

export default CurrentUserProvider;
