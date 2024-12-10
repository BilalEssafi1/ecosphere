import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import Asset from "../../components/Asset";
import { useParams } from "react-router-dom";
import styles from "../../styles/FolderBookmarksPage.module.css";

const FolderBookmarksPage = ({ match }) => {
  const { folder_id } = useParams;
  const [bookmarks, setBookmarks] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);

  /**
   * Fetch bookmarks for the specified folder.
   */
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const { data } = await axiosReq.get(`/folders/${folder_id}/bookmarks/`);
        setBookmarks(data.results);
        setHasLoaded(true);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      }
    };

    fetchBookmarks();
  }, [folder_id]);

  return (
    <div className={styles.FolderBookmarksPage}>
      <h1>Folder Bookmarks</h1>
      {hasLoaded ? (
        bookmarks.length ? (
          bookmarks.map((bookmark) => (
            <div key={bookmark.id} className={styles.BookmarkItem}>
              <p>{bookmark.post_title}</p>
            </div>
          ))
        ) : (
          <p>No bookmarks in this folder yet.</p>
        )
      ) : (
        <Asset spinner />
      )}
    </div>
  );
};

export default FolderBookmarksPage;
