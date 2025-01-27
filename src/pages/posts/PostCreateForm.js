import React, { useState, useRef } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Image from "react-bootstrap/Image";
import { useHistory } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";
import Asset from "../../components/Asset";
import { useRedirect } from "../../hooks/useRedirect";
import imageCompression from 'browser-image-compression';
import appStyles from "../../App.module.css";
import btnStyles from "../../styles/Button.module.css";
import styles from "../../styles/PostCreateEditForm.module.css";
import Upload from "../../assets/upload.png";

/**
 * Form component for creating new posts.
 * Includes fields for title, content, image, and hashtags.
 * Handles validation, image preview, and form submission.
 */
function PostCreateForm() {
  // Redirect users to login page if they are not authenticated
  useRedirect("loggedOut");

  // State to track errors
  const [errors, setErrors] = useState({});

  // State to manage post data
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    image: "",
    add_hashtags: "",
  });
  const { title, content, image, add_hashtags } = postData;

  // Ref to access the image input field
  const imageInput = useRef(null);
  const history = useHistory();

  /**
   * Handle changes to text fields (e.g., title, content, hashtags).
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setPostData({
      ...postData,
      [name]: name === 'title'
        ? (value.length > 50 ? value.slice(0, 50) : value)
        : (name === 'content'
          ? (value.length > 300 ? value.slice(0, 300) : value)
          : value),
    });
  };

  /**
   * Handle changes to the image input and update the preview image.
   */
  const handleChangeImage = async (event) => {
    if (event.target.files.length) {
      const originalImage = event.target.files[0];
      try {
        const compressedImage = await imageCompression(originalImage, {
          maxSizeMB: 1,          // Max file size
          maxWidth: 800,         // Max width of image
          maxHeight: 800,        // Max height of image
          useWebWorker: true
        });

        URL.revokeObjectURL(image);
        setPostData({
          ...postData,
          image: URL.createObjectURL(compressedImage),
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  /**
   * Handle form submission for creating a new post.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate that content is not empty
    if (!content) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        content: ["Content is required."],
      }));
      return;
    }

    // Prepare form data for submission
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("add_hashtags", add_hashtags);
    if (imageInput?.current?.files[0]) {
      formData.append("image", imageInput.current.files[0]);
    }

    try {
      // Submit the form data to the API
      const { data } = await axiosReq.post("/posts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      // Redirect to the newly created post
      history.push(`/posts/${data.id}`);
    } catch (err) {
      if (err.response?.status !== 401) {
        setErrors(err.response?.data);
      }
    }
  };

  // Text fields for post title, content, and hashtags
  const textFields = (
    <div className="text-center">
      {/* Title field */}
      <Form.Group>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={title}
          onChange={handleChange}
          required
          maxLength={50}
        />
        <small className="text-muted d-block text-right">
          {`${title.length}/50 characters`}
        </small>
        {errors?.title?.map((message, idx) => (
          <Alert variant="warning" key={idx}>
            {message}
          </Alert>
        ))}
      </Form.Group>

      {/* Content field */}
      <Form.Group>
        <Form.Label>Content</Form.Label>
        <Form.Control
          as="textarea"
          name="content"
          value={content}
          onChange={handleChange}
          rows={7}
          required
          maxLength={300}
        />
        <small className="text-muted d-block text-right">
          {`${content.length}/300 characters`}
        </small>
        {errors?.content?.map((message, idx) => (
          <Alert variant="warning" key={idx}>
            {message}
          </Alert>
        ))}
      </Form.Group>

      {/* Hashtags field */}
      <Form.Group>
        <Form.Label>Add hashtags</Form.Label>
        <Form.Control
          type="text"
          name="add_hashtags"
          value={add_hashtags}
          onChange={handleChange}
          placeholder="E.g., nature, travel, food"
        />
        <Form.Text className="text-muted">
          Add words only, separated by commas (e.g., nature, travel, food)
        </Form.Text>
      </Form.Group>
      {errors?.add_hashtags?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message} {/* Display error messages for the hashtags field */}
        </Alert>
      ))}

      {/* Cancel and Create buttons */}
      <Button
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        onClick={() => history.goBack()}
      >
        cancel
      </Button>
      <Button
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        type="submit"
      >
        create
      </Button>
    </div>
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        {/* Left column for the image input and preview */}
        <Col className="py-2 p-0 p-md-2" md={7} lg={8}>
          <Container
            className={`${appStyles.Content} ${styles.Container} d-flex flex-column justify-content-center`}
          >
            <Form.Group className="text-center">
              {image ? (
                <>
                  {/* Display the selected image preview */}
                  <figure>
                    <Image className={appStyles.Image} src={image} rounded />
                  </figure>
                  <div>
                    <Form.Label
                      className={`${btnStyles.Button} ${btnStyles.Blue} btn`}
                      htmlFor="image-upload"
                    >
                      Change the image
                    </Form.Label>
                  </div>
                </>
              ) : (
                <Form.Label
                  className="d-flex justify-content-center"
                  htmlFor="image-upload"
                >
                  <Asset
                    src={Upload}
                    message="Click or tap to upload an image"
                  />
                </Form.Label>
              )}
              {/* Image upload input field */}
              <Form.File
                id="image-upload"
                accept="image/*"
                onChange={handleChangeImage}
                ref={imageInput}
              />
            </Form.Group>
            {errors?.image?.map((message, idx) => (
              <Alert variant="warning" key={idx}>
                {message}
              </Alert>
            ))}

            {/* Render text fields on smaller screens */}
            <div className="d-md-none">{textFields}</div>
          </Container>
        </Col>

        {/* Right column for text fields (only visible on larger screens) */}
        <Col md={5} lg={4} className="d-none d-md-block p-0 p-md-2">
          <Container className={appStyles.Content}>{textFields}</Container>
        </Col>
      </Row>
    </Form>
  );
}

export default PostCreateForm;
