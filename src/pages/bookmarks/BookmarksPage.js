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
        console.log(err);
        setError("Failed to load folders");
        setHasLoaded(true);
      }
    };

    fetchFolders();
  }, []);

  /**
   * Update folders state after successful edit
   */
  const handleFolderEdit = (updatedFolder) => {
    setFolders(prevFolders => ({
      ...prevFolders,
      results: prevFolders.results.map(folder => 
        folder.id === updatedFolder.id ? updatedFolder : folder
      ),
    }));
  };

  /**
   * Update folders state after successful deletion
   */
  const handleFolderDelete = (deletedId) => {
    setFolders(prevFolders => ({
      ...prevFolders,
      results: prevFolders.results.filter(folder => folder.id !== deletedId),
    }));
  };

  return (
    <div className={styles.BookmarksPage}>
      <h1>Bookmarks</h1>
      {error && <div className={styles.ErrorMessage}>{error}</div>}
      {hasLoaded ? (
        folders.results.length ? (
          folders.results.map((folder) => (
            <div key={folder.id} className={styles.FolderItem}>
              <div className={styles.FolderContent}>
                <Link to={`/folders/${folder.id}`}>
                  <span className={styles.FolderName}>{folder.name}</span>
                  <span className={styles.BookmarkCount}>
                    {folder.bookmarks_count} saved
                  </span>
                </Link>
              </div>
              <div className={styles.FolderActions}>
                <BookmarkFolderDropdown 
                  folder={folder}
                  onEdit={handleFolderEdit}
                  onDelete={handleFolderDelete}
                />
              </div>
            </div>
          ))
        ) : (
          <p className={styles.NoResults}>
            No folders yet. Create some to start saving posts!
          </p>
        )
      ) : (
        <Asset spinner />
      )}
    </div>
  );
};

export default BookmarksPage;