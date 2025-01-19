import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import Asset from "../../components/Asset";
import { useParams } from "react-router-dom";
import styles from "../../styles/FolderBookmarksPage.module.css";
import Post from "../posts/Post";
import NoResults from "../../assets/no-results.png";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { BookmarkDropdown } from "../../components/BookmarkMoreDropdown";

/**
 * Displays all bookmarks within a specific folder
 * Handles bookmark removal and error states
 */
const FolderBookmarksPage = () => {
  const { folder_id } = useParams();
  const [bookmarks, setBookmarks] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = useCurrentUser();

  /**
   * Fetches bookmarks for the current folder
   */
  const fetchBookmarks = async () => {
    try {
      setHasLoaded(false);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please log in to view bookmarks");
        setHasLoaded(true);
        return;
      }

      const { data } = await axiosReq.get(`/folders/${folder_id}/bookmarks/`);
      setBookmarks(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load bookmarks");
    } finally {
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBookmarks();
    }
  }, [folder_id, currentUser]);

  /**
   * Handles removing a bookmark from the folder
   * Updates UI immediately and makes API call
   */
  const handleRemoveBookmark = async (bookmark) => {
    try {
      await axiosReq.delete(`/bookmarks/${bookmark.id}/`);
      setBookmarks(prevBookmarks => ({
        ...prevBookmarks,
        results: prevBookmarks.results.filter(b => b.id !== bookmark.id)
      }));
      setError(null);
    } catch (err) {
      setError("Failed to remove bookmark");
      console.error("Delete error:", err);
    }
  };

  return (
    <div className={styles.FolderBookmarksPage}>
      {error && <div className={styles.ErrorMessage}>{error}</div>}
      
      {hasLoaded ? (
        <>
          {bookmarks?.results?.length ? (
            bookmarks.results.map((bookmark) => (
              <div key={bookmark.id} className={styles.BookmarkItem}>
                <Post
                  {...bookmark.post}
                  setPosts={setBookmarks}
                  postPage
                />
                <div className={styles.BookmarkActions}>
                  <BookmarkDropdown
                    bookmark={bookmark}
                    onDelete={() => handleRemoveBookmark(bookmark)}
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
