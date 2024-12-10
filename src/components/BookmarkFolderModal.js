import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "../styles/BookmarkButton.module.css";
import { axiosReq } from "../api/axiosDefaults";
import Asset from "./Asset";

const BookmarkFolderModal = ({ show, handleClose, handleSelect }) => {
  // State for storing user's folders
  const [folders, setFolders] = useState({ results: [] });
  // Track loading state
  const [hasLoaded, setHasLoaded] = useState(false);
  // State for new folder input
  const [newFolderName, setNewFolderName] = useState("");

  /**
   * Fetch user's folders when modal opens
   */
  useEffect(() => {
    const getFolders = async () => {
      try {
        const { data } = await axiosReq.get("/folders/");
        setFolders(data);
        setHasLoaded(true);
      } catch (err) {
        console.log(err);
      }
    };

    if (show) {
      getFolders();
    }
  }, [show]);

  /**
   * Handles creation of new folder
   * Makes API request to create folder and updates state
   */
  const handleCreateFolder = async () => {
    try {
      const { data } = await axiosReq.post("/folders/", {
        name: newFolderName,
      });
      setFolders((prevFolders) => ({
        ...prevFolders,
        results: [data, ...prevFolders.results],
      }));
      setNewFolderName("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Save to Collection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* New folder creation section */}
        <div className={styles.CreateFolder}>
          <input
            type="text"
            placeholder="Create new folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <Button onClick={handleCreateFolder}>Create</Button>
        </div>

        {/* Folder list section */}
        {hasLoaded ? (
          folders.results.length ? (
            folders.results.map((folder) => (
              <div
                key={folder.id}
                className={styles.FolderItem}
                onClick={() => handleSelect(folder.id)}
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