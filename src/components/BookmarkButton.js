import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from "../styles/BookmarkButton.module.css";
import { axiosReq } from "../api/axiosDefaults";
import BookmarkFolderModal from "./BookmarkFolderModal";

const BookmarkButton = ({ post, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post?.is_bookmarked);

  /**
   * Handles saving a post to a specific folder.
   * Makes API request to create a new bookmark.
   */
  const handleBookmark = async (folderId) => {
    try {
      await axiosReq.post("/bookmarks/", {
        post: post.id,
        folder: folderId,
      });
      setIsBookmarked(true);
      setShowModal(false);
    } catch (err) {
      console.error("Error bookmarking post:", err);
    }
  };

  /**
   * Handles removing a bookmark.
   * Makes API request to delete the bookmark.
   */
  const handleUnbookmark = async () => {
    try {
      await axiosReq.delete(`/bookmarks/${post.bookmark_id}/`);
      setIsBookmarked(false);
    } catch (err) {
      console.error("Error unbookmarking post:", err);
    }
  };

  return (
    <>
      {currentUser ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{isBookmarked ? "Remove bookmark" : "Save post"}</Tooltip>}
        >
          <span onClick={() => (isBookmarked ? handleUnbookmark() : setShowModal(true))}>
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

      {/* Show modal for selecting a folder */}
      <BookmarkFolderModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSelect={handleBookmark}
      />
    </>
  );
};

export default BookmarkButton;
