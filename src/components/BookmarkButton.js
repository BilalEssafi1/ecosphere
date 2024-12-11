import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from "../styles/BookmarkButton.module.css";
import { axiosReq } from "../api/axiosDefaults";
import BookmarkFolderModal from "./BookmarkFolderModal";

/**
 * Handles bookmarking functionality for posts
 * Allows users to save posts to folders and remove bookmarks
 */
const BookmarkButton = ({ post, currentUser }) => {
  // State for modal visibility and bookmark status
  const [showModal, setShowModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post?.is_bookmarked);
  const [error, setError] = useState("");

  /**
   * Handles saving a post to a specific folder
   * Makes API request to create a new bookmark
   * Includes error handling and user feedback
   */
  const handleBookmark = async (folderId) => {
    try {
      // Clear any previous errors
      setError("");

      // Log the attempt for debugging
      console.log('Attempting to create bookmark:', {
        post: post.id,
        folder: folderId
      });

      const { data } = await axiosReq.post("/bookmarks/", {
        post: parseInt(post.id),
        folder: parseInt(folderId)
      });

      // Log successful bookmark creation
      console.log('Bookmark created:', data);
      setIsBookmarked(true);
      setShowModal(false);
    } catch (err) {
      // Enhanced error logging
      console.error("Error bookmarking post:", err);
      console.error("Error response:", err.response?.data);
      console.error("Status code:", err.response?.status);
      
      // Set error message for user feedback
      setError(err.response?.data?.detail || "Error saving bookmark. Please try again.");
      
      // Show error to user
      alert(error);
    }
  };

  /**
   * Handles removing a bookmark
   * Makes API request to delete the bookmark
   * Includes error handling
   */
  const handleUnbookmark = async () => {
    try {
      await axiosReq.delete(`/bookmarks/${post.bookmark_id}/`);
      setIsBookmarked(false);
    } catch (err) {
      console.error("Error unbookmarking post:", err);
      console.error("Error response:", err.response?.data);
      alert("Error removing bookmark. Please try again.");
    }
  };

  return (
    <>
      {currentUser ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{isBookmarked ? "Remove bookmark" : "Save post"}</Tooltip>}
        >
          <span 
            onClick={() => (isBookmarked ? handleUnbookmark() : setShowModal(true))}
            className={styles.BookmarkIconContainer}
          >
            <i
              className={`fa-solid fa-bookmark ${styles.BookmarkIcon} ${
                isBookmarked && styles.Bookmarked
              }`}
            />
          </span>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger placement="top" overlay={<Tooltip>Log in to save posts!</Tooltip>}>
          <i className="fa-solid fa-bookmark" />
        </OverlayTrigger>
      )}

      {/* Bookmark folder selection modal */}
      <BookmarkFolderModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSelect={handleBookmark}
      />
    </>
  );
};

export default BookmarkButton;
