import axios from "axios";

const baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";

// Default axios settings
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;
axios.defaults.headers.post["Content-Type"] = "application/json";

// Create axios instances
export const axiosReq = axios.create({
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

export const axiosRes = axios.create({
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

// Interceptors without cache-control headers
[axiosReq, axiosRes].forEach(instance => {
  instance.interceptors.request.use(
    config => {
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
});
