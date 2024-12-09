import axios from "axios";

// Base configuration for all axios requests
const baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";

// Set global defaults for axios
axios.defaults.baseURL = baseURL;
axios.defaults.headers.post["Content-Type"] = "application/json";  // Set JSON as default content type
axios.defaults.withCredentials = true;  // Include credentials in all requests
axios.defaults.xsrfCookieName = 'csrftoken';  // Django's CSRF cookie name
axios.defaults.xsrfHeaderName = 'X-CSRFToken';  // Django's CSRF header name

/**
 * Create axios instances with credentials support
 * axiosReq: Used for requests that require authentication
 * axiosRes: Used for responses and general requests
 */
export const axiosReq = axios.create({
  withCredentials: true
});

export const axiosRes = axios.create({
  withCredentials: true
});

/**
 * Add response interceptor to handle expired tokens
 * This interceptor will:
 * 1. Catch 401 (Unauthorized) errors
 * 2. Attempt to refresh the token
 * 3. Retry the original request if successful
 */
axiosReq.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt token refresh on 401 errors and if we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the authentication token
        await axios.post("/dj-rest-auth/token/refresh/", {}, {
          withCredentials: true
        });
        
        // If token refresh was successful, retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If token refresh fails, reject the promise
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
