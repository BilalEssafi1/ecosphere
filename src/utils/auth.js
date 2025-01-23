/**
 * Utility function to clear all authentication data
 * Removes tokens, cookies, and optionally redirects to signin
 */
export const clearAuthData = (redirect = true) => {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  
    // Clear all cookies with different domain variations
    const cookieOptions = [
      `csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=drf-api-green-social-61be33473742.herokuapp.com`,
      `csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com`,
      `csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
      `sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
      `my-app-auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
      `my-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
      `messages=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
    ];
  
    cookieOptions.forEach(cookie => {
      document.cookie = cookie;
      document.cookie = cookie + '; secure; samesite=none';
    });
  
    if (redirect) {
      setTimeout(() => {
        window.location.href = '/signin';
      }, 500);
    }
  };