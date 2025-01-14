import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import styles from "../styles/MoreDropdown.module.css";

// Three dots toggle component
const ThreeDots = React.forwardRef(({ onClick }, ref) => (
  <i
    className="fas fa-ellipsis-v"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  />
));

/**
 * Dropdown component for individual bookmarks
 * Provides option to remove bookmark from folder
 */
export const BookmarkDropdown = ({ bookmark, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Dropdown className="ml-auto" drop="left">
        <Dropdown.Toggle as={ThreeDots} />
        <Dropdown.Menu 
          className="text-center"
          popperConfig={{ strategy: "fixed" }}
        >
          <Dropdown.Item
            className={styles.DropdownItem}
            onClick={() => setShowDeleteModal(true)}
            aria-label="delete-bookmark"
          >
            <i className="fas fa-trash-alt" /> Remove bookmark
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Remove Bookmark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this bookmark?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              onDelete();
              setShowDeleteModal(false);
            }}
          >
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};