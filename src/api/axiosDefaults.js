import axios from "axios";

const baseURL = "https://drf-api-green-social-61be33473742.herokuapp.com/";

// Function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Default axios settings
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Create axios instances
export const axiosReq = axios.create({
  withCredentials: true
});

export const axiosRes = axios.create({
  withCredentials: true
});

// Add interceptors to include CSRF token
[axiosReq, axiosRes].forEach(instance => {
  instance.interceptors.request.use(
    config => {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
});