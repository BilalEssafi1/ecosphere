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
  // State management
  const [showModal, setShowModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post?.is_bookmarked);
  // Removed error state and added bookmarkId state
  const [bookmarkId, setBookmarkId] = useState(post?.bookmark_id);

  /**
   * Handles saving a post to a specific folder
   * Makes API request to create a new bookmark
   * Includes error handling and user feedback
   */
  const handleBookmark = async (folderId) => {
    try {
      if (!folderId) {
        alert("Please select a folder");
        return;
      }

      // Simplified post data structure
      const { data } = await axiosReq.post("/bookmarks/", {
        post: post.id,
        folder: folderId
      });

      // Added bookmark ID tracking
      setBookmarkId(data.id);
      setIsBookmarked(true);
      setShowModal(false);
    } catch (err) {
      // Improved error handling
      if (err.response?.status === 400) {
        alert(err.response.data.detail || "Error saving bookmark");
      } else {
        alert("An error occurred while saving the bookmark");
      }
      setShowModal(false);
    }
  };

  /**
   * Handles removing a bookmark
   * Makes API request to delete the bookmark
   * Includes error handling
   */
  const handleUnbookmark = async () => {
    try {
      // Added ID verification before deletion
      if (!bookmarkId) {
        console.error('No bookmark ID available');
        return;
      }
      await axiosReq.delete(`/bookmarks/${bookmarkId}/`);
      setIsBookmarked(false);
      setBookmarkId(null);
    } catch (err) {
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
