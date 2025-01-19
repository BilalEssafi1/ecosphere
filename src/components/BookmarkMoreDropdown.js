import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import styles from "../styles/MoreDropdown.module.css";
import { axiosReq } from "../api/axiosDefaults";

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
 * Dropdown component for managing individual bookmarks
 */
const BookmarkDropdown = ({ bookmark, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handles the deletion of a bookmark
   * Updates UI and makes API call
   */
  const handleDelete = async () => {
    try {
      await axiosReq.delete(`/bookmarks/${bookmark.id}/`);
      onDelete();
      setShowDeleteModal(false);
      setError("");
    } catch (err) {
      setError("Failed to delete bookmark");
      console.error("Delete error:", err);
    }
  };

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
            <i className="fas fa-trash-alt" /> Delete
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Remove Bookmark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          Are you sure you want to remove this bookmark?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

/**
 * Dropdown component for managing bookmark folders
 */
const BookmarkFolderDropdown = ({ folder, onEdit, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [error, setError] = useState("");

  /**
   * Handles editing folder name
   * Makes API call and updates UI
   */
  const handleEdit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', folderName);

      const { data } = await axiosReq.put(`/folders/${folder.id}/`, formData);
      onEdit(data);
      setShowEditModal(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update folder name");
    }
  };

  /**
   * Handles folder deletion
   * Makes API call and updates UI
   */
  const handleDelete = async () => {
    try {
      await axiosReq.delete(`/folders/${folder.id}/`);
      onDelete(folder.id);
      setShowDeleteModal(false);
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        onDelete(folder.id);
        setShowDeleteModal(false);
      } else {
        setError("Failed to delete folder");
        console.error("Delete error:", err);
      }
    }
  };

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
            onClick={() => setShowEditModal(true)}
            aria-label="edit-folder"
          >
            <i className="fas fa-edit" /> Edit folder
          </Dropdown.Item>
          <Dropdown.Item
            className={styles.DropdownItem}
            onClick={() => setShowDeleteModal(true)}
            aria-label="delete-folder"
          >
            <i className="fas fa-trash-alt" /> Delete folder
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Folder Name</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEdit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Folder Name</Form.Label>
              <Form.Control
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                isInvalid={!!error}
              />
              <Form.Control.Feedback type="invalid">
                {error}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!folderName.trim()}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          Are you sure you want to delete "{folder.name}"? This will also delete all bookmarks within the folder.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export { BookmarkDropdown, BookmarkFolderDropdown };
