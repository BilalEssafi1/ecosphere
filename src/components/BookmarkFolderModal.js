import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "../styles/FolderBookmarksPage.module.css";
import { axiosReq } from "../api/axiosDefaults";
import Asset from "./Asset";

/**
 * Displays a modal for selecting or creating bookmark folders
 * Includes folder creation and selection functionality
 */
const BookmarkFolderModal = ({ show, handleClose, handleSelect }) => {
  // State for managing folders data
  const [folders, setFolders] = useState({ results: [] });
  // State for new folder name input
  const [newFolderName, setNewFolderName] = useState("");
  // State for tracking data loading
  const [hasLoaded, setHasLoaded] = useState(false);

  /**
   * Fetch user's bookmark folders when the modal opens
   * Updates folders state with the fetched data
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

    if (show) {
      fetchFolders();
    }
  }, [show]);

  /**
   * Handles the creation of a new folder
   * Creates folder and updates the folders list
   */
  const handleCreateFolder = async () => {
    try {
      const { data } = await axiosReq.post("/folders/", {
        name: newFolderName,
      });
      setFolders((prev) => ({
        ...prev,
        results: [data, ...prev.results],
      }));
      setNewFolderName("");
    } catch (err) {
      console.error("Error creating folder:", err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Save to Collection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Create new folder section */}
        <div className={styles.CreateFolder}>
          <input
            type="text"
            placeholder="Create new folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className={styles.FolderInput}
          />
          <Button 
            onClick={handleCreateFolder}
            className={styles.CreateButton}
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </div>

        {/* Display folders list */}
        {hasLoaded ? (
          folders.results.length ? (
            folders.results.map((folder) => (
              <div
                key={folder.id}
                className={styles.FolderItem}
                onClick={() => handleSelect(folder.id)}
                role="button"
                aria-label={`Select folder ${folder.name}`}
              >
                <span>{folder.name}</span>
                <span>{folder.bookmarks_count} saved</span>
              </div>
            ))
          ) : (
            <p>No folders yet. Create one to start saving posts!</p>
          )
        ) : (
          <Asset spinner />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default BookmarkFolderModal;
