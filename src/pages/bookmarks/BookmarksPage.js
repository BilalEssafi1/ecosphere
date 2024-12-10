import React, { useEffect, useState } from "react";
import { axiosReq } from "../api/axiosDefaults";
import { Link } from "react-router-dom";
import Asset from "../components/Asset";
import styles from "../../styles/BookmarksPage.module.css";

const BookmarksPage = () => {
  const [folders, setFolders] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);

  /**
   * Fetch all bookmark folders on page load.
   */
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const { data } = await axiosReq.get("/folders/");
        setFolders(data);
        setHasLoaded(true);
      } catch (err) {
        console.error("Error fetching folders:", err);
      }
    };

    fetchFolders();
  }, []);

  return (
    <div className={styles.BookmarksPage}>
      <h1>Bookmarks</h1>
      {hasLoaded ? (
        folders.results.length ? (
          folders.results.map((folder) => (
            <Link to={`/folders/${folder.id}`} key={folder.id}>
              <div className={styles.FolderItem}>
                <span>{folder.name}</span>
                <span>{folder.bookmarks_count} saved</span>
              </div>
            </Link>
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
