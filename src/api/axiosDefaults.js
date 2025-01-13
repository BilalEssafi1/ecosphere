import axios from "axios";

axios.defaults.baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

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
    
    // If the error is 401 and we haven't already tried to refresh
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // If no refresh token, clear everything and redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/signin';
          return Promise.reject(err);
        }

        // Attempt to refresh the token
        const response = await axios.post(
          '/dj-rest-auth/token/refresh/',
          { refresh: refreshToken },
          { withCredentials: true }
        );

        if (response.data.access) {
          // Store the new access token
          localStorage.setItem('access_token', response.data.access);
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          // Retry the original request
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear everything and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);
