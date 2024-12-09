import axios from "axios";

const baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";

// Default axios settings
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Create axios instances with enhanced security
export const axiosReq = axios.create({
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  credentials: 'include'
});

export const axiosRes = axios.create({
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  credentials: 'include'
});

// Add security headers to all requests
[axiosReq, axiosRes].forEach(instance => {
  instance.interceptors.request.use(config => {
    config.headers = {
      ...config.headers,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    return config;
  });
});
