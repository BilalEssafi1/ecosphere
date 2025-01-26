import React, { useState, useEffect } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
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
 // State for error handling
 const [error, setError] = useState("");

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
       setHasLoaded(true);
     }
   };

   if (show) {
     fetchFolders();
   }
 }, [show]);

 /**
  * Handles the creation of a new folder
  * Creates folder and updates the folders list
  * Includes validation and error handling
  */
 const handleCreateFolder = async () => {
   // Reset error state
   setError("");
   
   // Validate folder name length
   if (newFolderName.length > 50) {
     setError("Folder name cannot exceed 50 characters");
     return;
   }

   // Validate empty input
   if (!newFolderName.trim()) {
     setError("Please enter a folder name");
     return;
   }

   // Validate special characters
   const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
   if (specialChars.test(newFolderName)) {
     setError("Folder name cannot contain special characters");
     return;
   }

   try {
     const { data } = await axiosReq.post("/folders/", {
       name: newFolderName,
     });
     
     setFolders((prev) => ({
       ...prev,
       results: [data, ...prev.results],
     }));
     setNewFolderName("");
     setError("");
   } catch (err) {
     console.log('Error response:', err.response);
     if (err.response?.status === 500) {
       setError("A folder with this name already exists");
     } else if (err.response?.data?.detail) {
       setError(err.response.data.detail);
     } else {
       setError("Something went wrong. Please try again.");
     }
   }
 };

 return (
   <Modal show={show} onHide={handleClose}>
     <Modal.Header closeButton>
       <Modal.Title>Save to Collection</Modal.Title>
     </Modal.Header>
     <Modal.Body>
       {error && <Alert variant="warning">{error}</Alert>}
       {/* Create new folder section */}
       <div className={styles.CreateFolder}>
         <input
           type="text"
           placeholder="Create new folder"
           value={newFolderName}
           onChange={(e) => {
             setNewFolderName(e.target.value);
             if (e.target.value.length > 50) {
               setError("Folder name cannot exceed 50 characters");
             } else {
               setError("");
             }
           }}
           className={styles.FolderInput}
         />
         <small className="text-muted d-block mb-2">
            {`${newFolderName.length}/50 characters`}
          </small>
         <Button
           onClick={handleCreateFolder}
           className={styles.CreateButton}
           disabled={!newFolderName.trim() || newFolderName.length > 50}
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
