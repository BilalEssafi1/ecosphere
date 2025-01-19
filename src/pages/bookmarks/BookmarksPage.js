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

  return (
    <div className={styles.BookmarksPage}>
      <h1>Bookmarks</h1>
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
                onEdit={(updatedFolder) => {
                  setFolders(prevFolders => ({
                    ...prevFolders,
                    results: prevFolders.results.map(folder => 
                      folder.id === updatedFolder.id ? updatedFolder : folder
                    ),
                  }));
                }}
                onDelete={(deletedId) => {
                  setFolders(prevFolders => ({
                    ...prevFolders,
                    results: prevFolders.results.filter(folder => folder.id !== deletedId),
                  }));
                }}
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
