import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import Asset from "../../components/Asset";
import { useParams } from "react-router-dom";
import styles from "../../styles/FolderBookmarksPage.module.css";
import Post from "../posts/Post";
import NoResults from "../../assets/no-results.png";

/**
 * FolderBookmarksPage Component
 * Displays all bookmarks within a specific folder
 */
const FolderBookmarksPage = () => {
  const { folder_id } = useParams();
  const [bookmarks, setBookmarks] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setHasLoaded(false);
        const { data } = await axiosReq.get(`/folders/${folder_id}/bookmarks/`);
        setBookmarks(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError("Failed to load bookmarks. Please try again later.");
      } finally {
        setHasLoaded(true);
      }
    };

    fetchBookmarks();
  }, [folder_id]);

  return (
    <div className={styles.FolderBookmarksPage}>
      <h1>Folder Bookmarks</h1>

      {error && <div className={styles.ErrorMessage}>{error}</div>}

      {hasLoaded ? (
        bookmarks?.results?.length ? (
          bookmarks.results.map((bookmark) => (
            <div key={bookmark.id} className={styles.BookmarkItem}>
              <Post
                {...bookmark.post}
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
