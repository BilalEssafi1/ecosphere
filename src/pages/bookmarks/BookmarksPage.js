import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { Link } from "react-router-dom";
import Asset from "../../components/Asset";
import styles from "../../styles/BookmarksPage.module.css";
import { BookmarkFolderDropdown } from "../../components/BookmarkMoreDropdown";

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
        setHasLoaded(true);
      }
    };

    fetchFolders();
  }, []);

  /**
   * Handle updating folder after edit
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
   * Handle removing folder after deletion
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
              <BookmarkFolderDropdown 
                folder={folder}
                onEdit={handleFolderEdit}
                onDelete={handleFolderDelete}
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
