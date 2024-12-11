import jwtDecode from "jwt-decode";
import { axiosReq } from "../api/axiosDefaults";

/**
 * Fetches more data for infinite scroll functionality
 */
export const fetchMoreData = async (resource, setResource) => {
  try {
    const { data } = await axiosReq.get(resource.next);
    setResource((prevResource) => ({
      ...prevResource,
      next: data.next,
      results: data.results.reduce((acc, cur) => {
        return acc.some((accResult) => accResult.id === cur.id)
          ? acc
          : [...acc, cur];
      }, prevResource.results),
    }));
  } catch (err) {}
};

/**
 * Helper function to update profile stats when following a user
 */
export const followHelper = (profile, clickedProfile, following_id) => {
  return profile.id === clickedProfile.id
    ? {
        ...profile,
        followers_count: profile.followers_count + 1,
        following_id,
      }
    : profile.is_owner
    ? { ...profile, following_count: profile.following_count + 1 }
    : profile;
};

/**
 * Helper function to update profile stats when unfollowing a user
 */
export const unfollowHelper = (profile, clickedProfile) => {
  return profile.id === clickedProfile.id
    ? {
        ...profile,
        followers_count: profile.followers_count - 1,
        following_id: null,
      }
    : profile.is_owner
    ? { ...profile, following_count: profile.following_count - 1 }
    : profile;
};

/**
 * Token Management Functions
 */

/**
 * Sets the timestamp for token refresh based on JWT expiration
 */
export const setTokenTimestamp = (data) => {
  try {
    if (data?.refresh_token) {
      const refreshTokenTimestamp = jwtDecode(data.refresh_token).exp;
      localStorage.setItem("refreshTokenTimestamp", refreshTokenTimestamp);
    }
    
    // Also store the access token if available
    if (data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data?.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
  } catch (err) {
  }
};

/**
 * Checks if token should be refreshed based on expiration time
 */
export const shouldRefreshToken = () => {
  const refreshTokenTimestamp = localStorage.getItem("refreshTokenTimestamp");
  if (!refreshTokenTimestamp) return false;
  
  const now = Math.round(Date.now() / 1000);
  return now >= parseInt(refreshTokenTimestamp) - 60; // Refresh 60 seconds before expiration
};

/**
 * Removes token timestamp and tokens from storage during logout
 */
export const removeTokenTimestamp = () => {
  localStorage.removeItem("refreshTokenTimestamp");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

/**
 * Gets the current access token
 */
export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

/**
 * Gets the current refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};
