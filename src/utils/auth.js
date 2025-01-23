/**
 * Helper functions for authentication and cookie management
 * Provides utilities for handling authentication state across the application
 */

/**
 * Get all possible domain options for cookie clearing
 * Returns an array of domain options to ensure complete cookie cleanup
 */
const getDomainOptions = () => {
  const domains = [
    'drf-api-green-social-61be33473742.herokuapp.com',
    '.herokuapp.com',
    null // null represents no domain specification
  ];
  return domains;
};

/**
 * Get value of a specific cookie
 * @param {string} name - Name of the cookie to retrieve
 * @returns {string|undefined} Cookie value if found, undefined otherwise
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

/**
 * Clear a specific cookie across all domains and paths
 * Ensures thorough cookie removal across different security configurations
 * @param {string} name - Name of the cookie to clear
 */
export const clearCookie = (name) => {
  const domains = getDomainOptions();
  const paths = ['/', '/api'];
  
  domains.forEach(domain => {
    paths.forEach(path => {
      const cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}`;
      document.cookie = cookieString;
      document.cookie = `${cookieString}; secure; samesite=none`;
    });
  });
};

/**
 * Clear all authentication data including tokens and cookies
 * Used during logout, before login attempts, and after account deletion
 * @param {boolean} redirect - Whether to redirect to signin page after clearing
 */
export const clearAuthData = (redirect = true) => {
  // Clear localStorage tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  // List of all auth-related cookies to clear
  const cookiesToClear = [
    'csrftoken',
    'sessionid',
    'messages',
    'my-app-auth',
    'my-refresh-token'
  ];

  // Clear each cookie
  cookiesToClear.forEach(cookieName => clearCookie(cookieName));

  // Optional redirect to signin page with delay to ensure cleanup completes
  if (redirect) {
    setTimeout(() => {
      window.location.href = '/signin';
    }, 500);
  }
};