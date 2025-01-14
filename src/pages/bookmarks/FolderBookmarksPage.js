import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import Asset from "../../components/Asset";
import { useParams, useHistory } from "react-router-dom";
import styles from "../../styles/FolderBookmarksPage.module.css";
import Post from "../posts/Post";
import NoResults from "../../assets/no-results.png";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { BookmarkDropdown, BookmarkFolderDropdown } from "../../components/BookmarkMoreDropdown";

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

  // Additional state for folder management functionality
  const history = useHistory();
  const [folder, setFolder] = useState(null);

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

        // Make authenticated requests to get both folder and bookmarks data
        const [{ data: folderData }, { data: bookmarksData }] = await Promise.all([
          axiosReq.get(`/folders/${folder_id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axiosReq.get(`/folders/${folder_id}/bookmarks/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        // Set both folder and bookmarks data
        setFolder(folderData);
        setBookmarks(bookmarksData);
        setError(null);
      } catch (err) {
        // Set error message for user feedback
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
      {/* Display any error messages */}
      {error && <div className={styles.ErrorMessage}>{error}</div>}

      {/* Conditional rendering based on loading and data states */}
      {hasLoaded ? (
        <>
          {/* Folder management header - new addition */}
          {folder && (
            <div className={styles.FolderHeader}>
              <h1>{folder.name}</h1>
              <BookmarkFolderDropdown
                folder={folder}
                onEdit={(updatedFolder) => setFolder(updatedFolder)}
                onDelete={() => history.push("/bookmarks")}
              />
            </div>
          )}

          {bookmarks?.results?.length ? (
            bookmarks.results.map((bookmark) => (
              <div key={bookmark.id} className={styles.BookmarkItem}>
                <Post
                  {...bookmark.post}
                  setPosts={setBookmarks}
                  postPage
                />
                {/* Bookmark removal dropdown - new addition */}
                <div className={styles.BookmarkActions}>
                  <BookmarkDropdown
                    bookmark={bookmark}
                    onDelete={(deletedId) => {
                      setBookmarks(prevBookmarks => ({
                        ...prevBookmarks,
                        results: prevBookmarks.results.filter(
                          b => b.id !== deletedId
                        ),
                      }));
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <Asset
              src={NoResults}
              message="No bookmarks found in this folder"
            />
          )}
        </>
      ) : (
        <Asset spinner />
      )}
    </div>
  );
};

export default FolderBookmarksPage;
