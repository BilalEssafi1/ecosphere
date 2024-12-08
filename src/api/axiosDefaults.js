import axios from "axios";

// Keep your existing configuration
axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
axios.defaults.withCredentials = true;

// Add CSRF configuration
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// Add request interceptor for authentication
axios.interceptors.request.use(
    config => {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor for handling auth errors
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Clear auth data on unauthorized response
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
            // Redirect to login
            window.location.href = "/signin";
        }
        return Promise.reject(error);
    }
);

// Keep your existing axios instances
export const axiosReq = axios.create();
export const axiosRes = axios.create();