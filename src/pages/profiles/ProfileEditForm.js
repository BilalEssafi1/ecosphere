import React, { useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import { axiosReq, axiosRes } from "../../api/axiosDefaults";
import {
  useCurrentUser,
  useSetCurrentUser,
} from "../../contexts/CurrentUserContext";
import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";

const ProfileEditForm = () => {
  // Hooks to access the current user and their profile, update state, and navigate history
  const currentUser = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const { id } = useParams();
  const history = useHistory();
  const imageFile = useRef();

  // State to manage profile data
  const [profileData, setProfileData] = useState({
    name: "",
    content: "",
    image: "",
  });
  const { name, content, image } = profileData; // Destructure profile data for easier access

  // State to manage errors (e.g., validation or API errors)
  const [errors, setErrors] = useState({});

  // Fetch and populate profile data on component mount
  useEffect(() => {
    const handleMount = async () => {
      // Ensure the current user is authorized to edit this profile
      if (currentUser?.profile_id?.toString() === id) {
        try {
          // Fetch the profile data
          const { data } = await axiosReq.get(`/profiles/${id}/`);
          const { name, content, image } = data;
          setProfileData({ name, content, image });
        } catch (err) {
          history.push("/");
        }
      } else {
        history.push("/");
      }
    };

    handleMount();
  }, [currentUser, history, id]);

  // Handle changes to form inputs
  const handleChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle form submission for updating profile
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("content", content);

    // Add image file if a new one is selected
    if (imageFile?.current?.files[0]) {
      formData.append("image", imageFile?.current?.files[0]);
    }

    try {
      // Update profile via PUT request
      const { data } = await axiosReq.put(`/profiles/${id}/`, formData);
      // Update the current user's profile image in context
      setCurrentUser((currentUser) => ({
        ...currentUser,
        profile_image: data.image,
      }));
      history.goBack();
    } catch (err) {
      setErrors(err.response?.data);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        // Delete the account via DELETE request
        await axiosRes.delete(`/profiles/${id}/`);
        setCurrentUser(null);
        history.push("/");
      } catch (err) {
        setErrors({ delete: ["Something went wrong. Please try again."] });
      }
    }
  };

  // Fields for text inputs and buttons (used in both mobile and desktop layouts)
  const textFields = (
    <>
      <Form.Group>
        <Form.Label>Bio</Form.Label>
        <Form.Control
          as="textarea"
          value={content}
          onChange={handleChange}
          name="content"
          rows={7}
        />
      </Form.Group>

      {/* Display content validation errors */}
      {errors?.content?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}
        </Alert>
      ))}

      {/* Cancel button */}
      <Button
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        onClick={() => history.goBack()}
      >
        cancel
      </Button>

      {/* Save button */}
      <Button className={`${btnStyles.Button} ${btnStyles.Blue}`} type="submit">
        save
      </Button>

      {/* Delete account button */}
      <Button
        className={`${btnStyles.Button} ${btnStyles.Danger}`}
        onClick={handleDelete}
      >
        delete account
      </Button>
    </>
  );

  // Main return with layout and functionality
  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        {/* Left column (profile image and form for smaller screens) */}
        <Col className="py-2 p-0 p-md-2 text-center" md={7} lg={6}>
          <Container className={appStyles.Content}>
            <Form.Group>
              {image && (
                <figure>
                  <Image src={image} fluid />
                </figure>
              )}
              {/* Display image upload validation errors */}
              {errors?.image?.map((message, idx) => (
                <Alert variant="warning" key={idx}>
                  {message}
                </Alert>
              ))}

              {/* Change image button */}
              <div>
                <Form.Label
                  className={`${btnStyles.Button} ${btnStyles.Blue} btn my-auto`}
                  htmlFor="image-upload"
                >
                  Change the image
                </Form.Label>
              </div>
              {/* Image upload input */}
              <Form.File
                id="image-upload"
                ref={imageFile}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files.length) {
                    setProfileData({
                      ...profileData,
                      image: URL.createObjectURL(e.target.files[0]),
                    });
                  }
                }}
              />
            </Form.Group>
            {/* Mobile layout: Display text fields under the image */}
            <div className="d-md-none">{textFields}</div>
          </Container>
        </Col>

        {/* Right column (text fields for larger screens) */}
        <Col md={5} lg={6} className="d-none d-md-block p-0 p-md-2 text-center">
          <Container className={appStyles.Content}>{textFields}</Container>
        </Col>
      </Row>
    </Form>
  );
};

export default ProfileEditForm;
