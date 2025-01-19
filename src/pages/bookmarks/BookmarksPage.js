import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { Link } from "react-router-dom";
import Asset from "../../components/Asset";
import styles from "../../styles/BookmarksPage.module.css";
import { BookmarkFolderDropdown } from "../../components/BookmarkMoreDropdown";

const BookmarksPage = () => {
  const [folders, setFolders] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchFolders = async () => {
      try {
        const { data } = await axiosReq.get("/folders/", {
          signal: abortController.signal
        });
        if (!abortController.signal.aborted) {
          setFolders(data);
          setHasLoaded(true);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching folders:", err);
          setError("Failed to load folders");
          setHasLoaded(true);
        }
      }
    };

    fetchFolders();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className={styles.BookmarksPage}>
      <h1>Bookmarks</h1>
      {error && <div className={styles.ErrorMessage}>{error}</div>}
      {hasLoaded ? (
        folders.results.length ? (
          folders.results.map((folder) => (
            <div key={folder.id} className={styles.FolderItem}>
              <Link to={`/folders/${folder.id}`} className={styles.FolderContent}>
                <span>{folder.name}</span>
                <span>{folder.bookmarks_count} saved</span>
              </Link>
              <BookmarkFolderDropdown
                folder={folder}
                setFolders={setFolders}
              />
            </div>
          ))
        ) : (
          <p>No folders yet. Create some to start saving posts!</p>
        )
      ) : (
        <Asset spinner />
      )}
    </div>
  );
};

export default BookmarksPage;
