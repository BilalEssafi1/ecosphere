import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from "../styles/BookmarkButton.module.css";
import { axiosRes } from "../api/axiosDefaults";
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
      const { data } = await axiosRes.post("/bookmarks/", {
        post: post.id,
        folder: folderId,
      });
      setIsBookmarked(true);
      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Handles removing a bookmark
   * Makes API request to delete bookmark
   */
  const handleUnbookmark = async () => {
    try {
      await axiosRes.delete(`/bookmarks/${post.bookmark_id}/`);
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