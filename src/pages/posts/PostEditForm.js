import React, { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Image from "react-bootstrap/Image";
import styles from "../../styles/PostCreateEditForm.module.css";
import appStyles from "../../App.module.css";
import btnStyles from "../../styles/Button.module.css";
import { useHistory, useParams } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";

function PostEditForm() {
  // State to track errors from the server response
  const [errors, setErrors] = useState({});

  // State to track the form data (title, content, image, hashtags)
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    image: "",
    add_hashtags: "",
  });

  // Destructure the state variables for easier access
  const { title, content, image, add_hashtags } = postData;

  // Ref to access the image input element
  const imageInput = useRef(null);

  // For routing (to redirect user after successful submission)
  const history = useHistory();

  // Get the post ID from URL params
  const { id } = useParams();

  // Fetch the existing post data when the component mounts
  useEffect(() => {
    const handleMount = async () => {
      try {
        // Fetch post data from the server using the post ID
        const { data } = await axiosReq.get(`/posts/${id}/`);
        const { title, content, image, add_hashtags, is_owner } = data;

        // Check if the current user is the owner of the post
        if (is_owner) {
          // If so, populate the state with the post data
          setPostData({ title, content, image, add_hashtags });
        } else {
          // If not, redirect the user to the home page
          history.push("/");
        }
      } catch (err) {
        console.log(err);
      }
    };

    handleMount();
  }, [history, id]); // Re-run this effect if the post ID or history changes

  // Handle changes in form input fields (title, content, hashtags)
  const handleChange = (event) => {
    setPostData({
      ...postData,
      [event.target.name]: event.target.value,  // Update the specific field in state
    });
  };

  // Handle image file changes and create a URL for preview
  const handleChangeImage = (event) => {
    if (event.target.files.length) {
      URL.revokeObjectURL(image);  // Revoke the previous image URL to prevent memory leaks
      setPostData({
        ...postData,
        image: URL.createObjectURL(event.target.files[0]),  // Create a new object URL for the selected image
      });
    }
  };

  // Handle form submission (saving the post)
  const handleSubmit = async (event) => {
    event.preventDefault();  // Prevent the default form submit behavior

    const formData = new FormData();

    // Append title, content, and hashtags to the FormData
    formData.append("title", title);
    formData.append("content", content);
    formData.append("add_hashtags", add_hashtags);  // Include the hashtags

    // If a new image is selected, append it to the FormData
    if (imageInput?.current?.files[0]) {
      formData.append("image", imageInput.current.files[0]);
    }

    try {
      // Send a PUT request to update the post on the server
      await axiosReq.put(`/posts/${id}/`, formData);
      // Redirect to the updated post page after successful submission
      history.push(`/posts/${id}`);
    } catch (err) {
      console.log(err);
      // If an error occurs, display the error messages
      if (err.response?.status !== 401) {
        setErrors(err.response?.data);
      }
    }
  };

  // Render the form fields (title, content, hashtags)
  const textFields = (
    <div className="text-center">
      {/* Title field */}
      <Form.Group>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={title}
          onChange={handleChange}  // Update state when the user changes the title
        />
      </Form.Group>
      {/* Display errors related to the title field */}
      {errors?.title?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}
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
          onChange={handleChange}  // Update state when the user changes the content
        />
      </Form.Group>
      {/* Display errors related to the content field */}
      {errors?.content?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}
        </Alert>
      ))}

      {/* Add Hashtags field */}
      <Form.Group>
        <Form.Label>Add hashtags</Form.Label>
        <Form.Control
          type="text"
          name="add_hashtags"
          value={add_hashtags}
          onChange={handleChange}  // Update state when the user changes the hashtags
          placeholder="E.g., nature, travel, food"
        />
        <Form.Text className="text-muted">
          Add words only, separated by commas (e.g., nature, travel, food)
        </Form.Text>
      </Form.Group>
      {/* Display errors related to the hashtags field */}
      {errors?.add_hashtags?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}
        </Alert>
      ))}

      {/* Cancel and Save buttons */}
      <Button
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        onClick={() => history.goBack()}  // Go back to the previous page when cancel is clicked
      >
        cancel
      </Button>
      <Button className={`${btnStyles.Button} ${btnStyles.Blue}`} type="submit">
        save  {/* Save the post when this button is clicked */}
      </Button>
    </div>
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        {/* Column for the image preview */}
        <Col className="py-2 p-0 p-md-2" md={7} lg={8}>
          <Container
            className={`${appStyles.Content} ${styles.Container} d-flex flex-column justify-content-center`}
          >
            <Form.Group className="text-center">
              {/* Display the image if available */}
              <figure>
                <Image className={appStyles.Image} src={image} rounded />
              </figure>
              <div>
                <Form.Label
                  className={`${btnStyles.Button} ${btnStyles.Blue} btn`}
                  htmlFor="image-upload"
                >
                  Change the image  {/* Prompt the user to change the image */}
                </Form.Label>
              </div>

              {/* Image upload input */}
              <Form.File
                id="image-upload"
                accept="image/*"
                onChange={handleChangeImage}  // Handle the image change
                ref={imageInput}
              />
            </Form.Group>
            {/* Display any image-related errors */}
            {errors?.image?.map((message, idx) => (
              <Alert variant="warning" key={idx}>
                {message}
              </Alert>
            ))}

            <div className="d-md-none">{textFields}</div>  {/* Render text fields on smaller screens */}
          </Container>
        </Col>

        {/* Column for the text fields (title, content, hashtags) */}
        <Col md={5} lg={4} className="d-none d-md-block p-0 p-md-2">
          <Container className={appStyles.Content}>{textFields}</Container>
        </Col>
      </Row>
    </Form>
  );
}

export default PostEditForm;
