import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from "../styles/BookmarkButton.module.css";
import { axiosReq } from "../api/axiosDefaults";
import BookmarkFolderModal from "./BookmarkFolderModal";

const BookmarkButton = ({ post, currentUser }) => {
  // Track modal visibility state
  const [showModal, setShowModal] = useState(false);
  // Track if the current post is bookmarked
  const [isBookmarked, setIsBookmarked] = useState(post?.is_bookmarked);

  /**
   * Handles saving a post to a specific folder
   * Makes API request to create new bookmark
   */
  const handleBookmark = async (folderId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axiosReq.post("/bookmarks/", {
        post: post.id,
        folder: folderId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsBookmarked(true);
      setShowModal(false);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("Authentication error when bookmarking");
      }
      console.log(err);
    }
  };

  /**
   * Handles removing a bookmark
   * Makes API request to delete bookmark
   */
  const handleUnbookmark = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axiosReq.delete(`/bookmarks/${post.bookmark_id}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsBookmarked(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {/* Show different UI based on user authentication */}
      {currentUser ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{isBookmarked ? "Remove bookmark" : "Save post"}</Tooltip>}
        >
          <span onClick={() => isBookmarked ? handleUnbookmark() : setShowModal(true)}>
            <i className={`fa-solid fa-bookmark ${styles.BookmarkIcon} ${isBookmarked && styles.Bookmarked}`} />
          </span>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Log in to save posts!</Tooltip>}
        >
          <i className="fa-solid fa-bookmark" />
        </OverlayTrigger>
      )}

      {/* Folder selection modal */}
      <BookmarkFolderModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSelect={handleBookmark}
      />
    </>
  );
};

export default BookmarkButton;