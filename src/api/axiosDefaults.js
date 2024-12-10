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
 * Adds authentication token and CSRF token to all requests if available
 */
axiosReq.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if it exists in cookies
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
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
 */
axiosRes.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
        const { data } = await axios.post("/dj-rest-auth/token/refresh/", {}, {
          withCredentials: true,
        });

        // Save the new access token
        localStorage.setItem("access_token", data.access);

        // Update the Authorization header and retry the failed request
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.access}`;

        return axiosRes(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear tokens and redirect to login page if refresh fails
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);
