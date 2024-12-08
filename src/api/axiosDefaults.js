import axios from "axios";

// Set the base URL for all API requests.
axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";

// Ensure POST requests send data in the correct format (multipart/form-data in this case).
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";

// Include cookies (such as CSRF tokens or JWT) in all requests to enable secure authentication.
axios.defaults.withCredentials = true;

// Create an instance for general authenticated requests.
export const axiosReq = axios.create();

// Create another instance for handling API responses.
export const axiosRes = axios.create();