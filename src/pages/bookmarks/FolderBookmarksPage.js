import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import Asset from "../../components/Asset";
import { useParams } from "react-router-dom";
import styles from "../../styles/FolderBookmarksPage.module.css";
import Post from "../posts/Post";
import NoResults from "../../assets/no-results.png";
import { useCurrentUser } from "../../contexts/CurrentUserContext";

/**
 * Displays all bookmarks within a specific folder
 * Handles authentication, loading states, and error handling
 */
const FolderBookmarksPage = () => {
  // Get folder ID from URL parameters
  const { folder_id } = useParams();
  // State for storing bookmarks data
  const [bookmarks, setBookmarks] = useState({ results: [] });
  // Loading state management
  const [hasLoaded, setHasLoaded] = useState(false);
  // Error state management
  const [error, setError] = useState(null);
  // Get current user context for authentication
  const currentUser = useCurrentUser();

  useEffect(() => {
    /**
     * Fetches bookmarks from the API with proper authentication
     * Includes error handling and loading states
     */
    const fetchBookmarks = async () => {
      try {
        setHasLoaded(false);
        // Verify authentication token exists
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please log in to view bookmarks");
          setHasLoaded(true);
          return;
        }

        // Make authenticated request to get bookmarks
        const { data } = await axiosReq.get(`/folders/${folder_id}/bookmarks/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Debug log to verify data structure
        console.log("Bookmarks data received:", data);
        setBookmarks(data);
        setError(null);
      } catch (err) {
        // Enhanced error logging for debugging
        console.error("Error fetching bookmarks:", err);
        console.error("Error response data:", err.response?.data);
        setError(err.response?.data?.detail || "Failed to load bookmarks");
      } finally {
        setHasLoaded(true);
      }
    };

    // Only fetch bookmarks if user is authenticated
    if (currentUser) {
      fetchBookmarks();
    }
  }, [folder_id, currentUser]);

  return (
    <div className={styles.FolderBookmarksPage}>
      <h1>Folder Bookmarks</h1>

      {/* Display any error messages */}
      {error && <div className={styles.ErrorMessage}>{error}</div>}

      {/* Conditional rendering based on loading and data states */}
      {hasLoaded ? (
        bookmarks?.results?.length ? (
          bookmarks.results.map((bookmark) => (
            <div key={bookmark.id} className={styles.BookmarkItem}>
              {/* Debug log for individual bookmark data */}
              {console.log("Rendering bookmark:", bookmark)}
              <Post
                {...bookmark.post}
                setPosts={setBookmarks}
                postPage
              />
            </div>
          ))
        ) : (
          <Asset
            src={NoResults}
            message="No bookmarks found in this folder"
          />
        )
      ) : (
        <Asset spinner />
      )}
    </div>
  );
};

export default FolderBookmarksPage;
