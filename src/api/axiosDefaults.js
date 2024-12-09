import axios from "axios";

// Set base URL for API requests
axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";
// Set default content type for POST requests
axios.defaults.headers.post["Content-Type"] = "application/json";
// Enable credentials for cross-origin requests
axios.defaults.withCredentials = true;

// Create axios instances for requests and responses
export const axiosReq = axios.create();
export const axiosRes = axios.create();

/**
 * Request interceptor for axiosReq
 * Adds authentication token to all requests if available
 */
axiosReq.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Request interceptor for axiosRes
 * Adds authentication token to all response requests if available
 */
axiosRes.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);