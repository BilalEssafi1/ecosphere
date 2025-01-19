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

const BookmarkDropdown = ({ bookmark, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");

    try {
      await axiosReq.delete(`/bookmarks/${bookmark.id}/`);
      onDelete();
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete bookmark. Please try again.");
    } finally {
      setIsDeleting(false);
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
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Removing..." : "Remove"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const BookmarkFolderDropdown = ({ folder, setFolders }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = async (event) => {
    event.preventDefault();
    if (isEditing || !folderName.trim()) return;

    setIsEditing(true);
    setError("");

    try {
      const trimmedName = folderName.trim();
      
      // Check if name is unchanged
      if (trimmedName === folder.name) {
        setShowEditModal(false);
        return;
      }

      const response = await axiosReq.put(`/folders/${folder.id}/`, {
        name: trimmedName,
      });

      if (response.status === 200) {
        setFolders(prevFolders => ({
          ...prevFolders,
          results: prevFolders.results.map(f =>
            f.id === folder.id ? { ...f, name: response.data.name } : f
          ),
        }));
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Edit error:", err);
      if (err.response?.data?.detail === "A folder with this name already exists") {
        setError("You already have a folder with this name. Please choose a different name.");
      } else {
        setError(err.response?.data?.detail || "Failed to update folder name");
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");

    try {
      await axiosReq.delete(`/folders/${folder.id}/`);
      setFolders(prevFolders => ({
        ...prevFolders,
        results: prevFolders.results.filter(f => f.id !== folder.id),
      }));
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete error:", err);
      try {
        // Check if folder still exists
        await axiosReq.get(`/folders/${folder.id}/`);
        setError("Failed to delete folder. Please try again.");
      } catch (checkErr) {
        if (checkErr.response?.status === 404) {
          // Folder is gone, update UI
          setFolders(prevFolders => ({
            ...prevFolders,
            results: prevFolders.results.filter(f => f.id !== folder.id),
          }));
          setShowDeleteModal(false);
        } else {
          setError("Failed to delete folder. Please try again.");
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setError("");
    setFolderName(folder.name);
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
      <Modal show={showEditModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Folder Name</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEdit}>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}
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
            <Button 
              variant="secondary" 
              onClick={handleModalClose}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!folderName.trim() || isEditing || folderName.trim() === folder.name}
            >
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <p>Are you sure you want to delete "{folder.name}"?</p>
          <p className="text-danger">This will also delete all bookmarks within the folder.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleModalClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export { BookmarkDropdown, BookmarkFolderDropdown };
