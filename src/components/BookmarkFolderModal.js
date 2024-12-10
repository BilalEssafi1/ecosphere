import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "../styles/BookmarkFolderModal.module.css";
import { axiosReq } from "../api/axiosDefaults";
import Asset from "./Asset";

const BookmarkFolderModal = ({ show, handleClose, handleSelect }) => {
  const [folders, setFolders] = useState({ results: [] });
  const [newFolderName, setNewFolderName] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  /**
   * Fetch user's bookmark folders when the modal opens.
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
   * Handle the creation of a new folder.
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
        {/* Create new folder */}
        <div className={styles.CreateFolder}>
          <input
            type="text"
            placeholder="Create new folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <Button onClick={handleCreateFolder}>Create</Button>
        </div>

        {/* Display folders */}
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
