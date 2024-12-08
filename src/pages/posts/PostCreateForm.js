import React, { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Image from "react-bootstrap/Image";
import Asset from "../../components/Asset";
import Upload from "../../assets/upload.png";
import styles from "../../styles/PostCreateEditForm.module.css";
import appStyles from "../../App.module.css";
import btnStyles from "../../styles/Button.module.css";
import { useHistory } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";
import { useRedirect } from "../../hooks/useRedirect";

function PostCreateForm() {
  useRedirect("loggedOut");  // Redirect users to login if not authenticated
  const [errors, setErrors] = useState({});
  
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    image: "",
    add_hashtags: "",  // Changed from tags to add_hashtags to match API
  });
  const { title, content, image, add_hashtags } = postData;

  const imageInput = useRef(null);  // Ref to access the image input field
  const history = useHistory();

  // Handle changes to form fields like title and content
  const handleChange = (event) => {
    setPostData({
      ...postData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle changes to the image input
  const handleChangeImage = (event) => {
    if (event.target.files.length) {
      URL.revokeObjectURL(image);  // Revoke any previously created URLs to avoid memory leaks
      setPostData({
        ...postData,
        image: URL.createObjectURL(event.target.files[0]),  // Set new image URL for preview
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if content is empty
    if (!content) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        content: ["Content is required."]
      }));
      return;
    }

    const formData = new FormData();

    formData.append("title", title);  // Append title to form data
    formData.append("content", content);  // Append content to form data
    formData.append("image", imageInput.current.files[0]);  // Append image to form data
    formData.append("add_hashtags", add_hashtags);  // Changed to add_hashtags

    try {
      const { data } = await axiosReq.post("/posts/", formData);  // POST request to create a new post
      history.push(`/posts/${data.id}`);  // Redirect to the newly created post
    } catch (err) {
      if (err.response?.status !== 401) {
        setErrors(err.response?.data);  // Set errors if the request fails
      }
    }
  };

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
          required  // Make title field mandatory
        />
      </Form.Group>
      {errors?.title?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}  {/* Display error messages for title field */}
        </Alert>
      ))}

      {/* Content field */}
      <Form.Group>
        <Form.Label>Content</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          name="content"
          value={content}
          onChange={handleChange}
          required  // Make content field mandatory
        />
      </Form.Group>
      {errors?.content?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}  {/* Display error messages for content field */}
        </Alert>
      ))}

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
          {message}  {/* Display error messages for hashtags field */}
        </Alert>
      ))}

      {/* Cancel and Create buttons */}
      <Button
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        onClick={() => history.goBack()}
      >
        cancel
      </Button>
      <Button className={`${btnStyles.Button} ${btnStyles.Blue}`} type="submit">
        create
      </Button>
    </div>
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col className="py-2 p-0 p-md-2" md={7} lg={8}>
          <Container
            className={`${appStyles.Content} ${styles.Container} d-flex flex-column justify-content-center`}
          >
            <Form.Group className="text-center">
              {image ? (
                <>
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

            <div className="d-md-none">{textFields}</div>
          </Container>
        </Col>
        <Col md={5} lg={4} className="d-none d-md-block p-0 p-md-2">
          <Container className={appStyles.Content}>{textFields}</Container>
        </Col>
      </Row>
    </Form>
  );
}

export default PostCreateForm;