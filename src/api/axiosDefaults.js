import axios from "axios";

axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

export const axiosReq = axios.create();
export const axiosRes = axios.create();

axiosReq.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (err) {
      return Promise.reject(err);
    }
  },
  (err) => {
    return Promise.reject(err);
  }
);

axiosRes.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;
    
    if (err.response?.status === 401) {
      try {
        const refreshResponse = await axios.post(
          '/dj-rest-auth/token/refresh/',
          { refresh: localStorage.getItem('refresh_token') },
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (refreshResponse.data.access) {
          localStorage.setItem('access_token', refreshResponse.data.access);
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
        window.location.href = '/signin';
      }
    }
    return Promise.reject(err);
  }
);
