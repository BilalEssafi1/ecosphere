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
* Includes improved error handling and debugging
*/
axiosRes.interceptors.response.use(
 (response) => response,
 async (error) => {
   const originalRequest = error.config;
  
   // Debug logging for error tracking
   console.log('Response Error Status:', error.response?.status);
   console.log('Original Request:', originalRequest);


   // Check if the error is due to an expired access token
   if (error.response?.status === 401 && !originalRequest._retry) {
     originalRequest._retry = true;
     try {
       // Attempt to refresh the token
       const { data } = await axios.post("/dj-rest-auth/token/refresh/");
      
       // Debug logging for successful token refresh
       console.log('Token refresh successful:', data);
      
       // Save the new access token
       localStorage.setItem("access_token", data.access);


       // Update the Authorization header and retry the failed request
       originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
       return axiosRes(originalRequest);
     } catch (refreshError) {
       // Debug logging for refresh errors
       console.log('Token refresh failed:', refreshError);
      
       // Only clear tokens and redirect if refresh actually failed with 401
       if (refreshError.response?.status === 401) {
         // Clear tokens if refresh fails
         localStorage.removeItem("access_token");
        
         // Redirect to login page
         window.location.href = "/signin";
       }
       return Promise.reject(refreshError);
     }
   }
   return Promise.reject(error);
 }
);
