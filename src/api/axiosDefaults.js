import axios from "axios";

// Set base URL for API requests
axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";

// Set default content type for POST requests
axios.defaults.headers.post["Content-Type"] = "application/json";

// Create axios instances for requests and responses
export const axiosReq = axios.create();
export const axiosRes = axios.create();

/**
 * Request interceptor for axiosReq
 * Adds authentication token to all requests if available
 */
axiosReq.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
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

/**
 * Response interceptor for axiosRes
 * Handles refreshing tokens if access token has expired
 * Includes retry logic, improved error handling, and debugging
 */
axiosRes.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Debug logging for error tracking
    console.log('Response Error Status:', error.response?.status);
    console.log('Original Request:', originalRequest);

    // Check if the error is due to an expired access token (401 error)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      let retryCount = 0;

      // Retry the token refresh (up to 3 times)
      while (retryCount < 3) {
        try {
          const { data } = await axios.post("/dj-rest-auth/token/refresh/");
          
          // Debug logging for successful token refresh
          console.log('Token refresh successful:', data);

          // Save the new access token
          localStorage.setItem("access_token", data.access);

          // Update the Authorization header and retry the failed request
          originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
          return axiosRes(originalRequest);
        } catch (refreshError) {
          retryCount++;
          console.log(`Token refresh attempt ${retryCount} failed:`, refreshError);

          if (retryCount === 3) {
            // If token refresh fails after 3 attempts, log out the user
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");  // Clear both tokens
            window.location.href = "/signin";  // Redirect to login page
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
