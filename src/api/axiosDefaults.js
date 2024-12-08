import axios from "axios";

// Set base URL for API requests
axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";

// Ensure cookies are included in cross-origin requests (important for JWT)
axios.defaults.withCredentials = true;

// Create two axios instances - one for requests and one for responses
export const axiosReq = axios.create();  // This will be used for requests that require JWT tokens
export const axiosRes = axios.create();  // This will be used for responses (non-secure)

// Request Interceptor: Add JWT token to headers if it exists
axiosReq.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("access_token"); // Get token from localStorage or context
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Attach token to every request
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token refresh
axiosRes.interceptors.response.use(
  (response) => response,  // If response is successful, return it
  async (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401 error (Unauthorized), try to refresh the token
      try {
        // Send a request to refresh the token
        const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
          refresh: localStorage.getItem("refresh_token"),
        });

        // Update the access token in localStorage
        localStorage.setItem("access_token", data.access);
        // Retry the original request with the new token
        error.config.headers["Authorization"] = `Bearer ${data.access}`;
        return axios(error.config);  // Retry the failed request
      } catch (err) {
        console.log("Token refresh failed:", err);
        // If token refresh fails, redirect to login or show an error message
        window.location.href = "/signin";  // Or use history.push('/signin')
      }
    }
    return Promise.reject(error);
  }
);
