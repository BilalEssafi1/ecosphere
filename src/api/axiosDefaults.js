import axios from "axios";

// Set base URL for API requests
axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";

// Create two axios instances - one for requests and one for responses
export const axiosReq = axios.create();  // This will be used for requests that require JWT tokens
export const axiosRes = axios.create();  // This will be used for responses (non-secure)
