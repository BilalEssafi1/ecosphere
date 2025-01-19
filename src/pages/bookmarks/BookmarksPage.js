import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { Link } from "react-router-dom";
import Asset from "../../components/Asset";
import styles from "../../styles/BookmarksPage.module.css";
import { BookmarkFolderDropdown } from "../../components/BookmarkMoreDropdown";

/**
 * Displays a list of bookmark folders with options to edit and delete
 * Handles folder management functionality
 */
const BookmarksPage = () => {
  // State for managing folders data and loading state
  const [folders, setFolders] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  // Fetch folders when component mounts
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const { data } = await axiosReq.get("/folders/");
        setFolders(data);
        setHasLoaded(true);
      } catch (err) {
        setError("Failed to load folders");
        setHasLoaded(true);
      }
    };

    fetchFolders();
  }, []);

  /**
   * Handles updating folder state after editing
   * @param {Object} updatedFolder - The folder with updated data
   */
  const handleEditFolder = async (updatedFolder) => {
    try {
      setFolders(prevFolders => ({
        ...prevFolders,
        results: prevFolders.results.map(folder =>
          folder.id === updatedFolder.id ? updatedFolder : folder
        ),
      }));
      setError("");
    } catch (err) {
      setError("Failed to update folder");
      console.error('Error updating folder:', err);
    }
  };

  /**
   * Handles removing folder from state after deletion
   * @param {number} deletedId - The ID of the deleted folder
   */
  const handleDeleteFolder = async (deletedId) => {
    try {
      setFolders(prevFolders => ({
        ...prevFolders,
        results: prevFolders.results.filter(folder => folder.id !== deletedId),
      }));
      setError("");
    } catch (err) {
      setError("Failed to delete folder");
      console.error('Error deleting folder:', err);
    }
  };

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
                onEdit={handleEditFolder}
                onDelete={handleDeleteFolder}
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
