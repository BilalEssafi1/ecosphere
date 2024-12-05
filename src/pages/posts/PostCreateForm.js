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
  const [tags, setTags] = useState([]); // State to store selected tags
  const [availableTags, setAvailableTags] = useState([]); // State to store tags fetched from the backend

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    image: "",
  });
  const { title, content, image } = postData;

  const imageInput = useRef(null);  // Ref to access the image input field
  const history = useHistory();

  // Fetch available tags from the backend API
  const fetchTags = async () => {
    try {
      const { data } = await axiosReq.get("/tags/");  // GET request to fetch tags
      setAvailableTags(data);  // Set available tags in state
    } catch (err) {
      console.log(err);  // Handle errors if the request fails
    }
  };

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

  // Handle changes to tag selection
  const handleTagChange = (event) => {
    // Get all selected tag values
    const selectedTags = Array.from(event.target.selectedOptions, (option) => option.value);
    setTags(selectedTags);  // Update the tags state with the selected tags
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    formData.append("title", title);  // Append title to form data
    formData.append("content", content);  // Append content to form data
    formData.append("image", imageInput.current.files[0]);  // Append image to form data
    tags.forEach((tag) => formData.append("tags", tag));  // Append selected tags to form data

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
        />
      </Form.Group>
      {errors?.content?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}  {/* Display error messages for content field */}
        </Alert>
      ))}

      {/* Tags selection field */}
      <Form.Group>
        <Form.Label>Tags</Form.Label>
        <Form.Control
          as="select"
          multiple
          name="tags"
          value={tags}
          onChange={handleTagChange}  // Handle changes to tag selection
        >
          {availableTags.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name}  {/* Display tag name in the dropdown */}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      {errors?.tags?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}  {/* Display error messages for tags field */}
        </Alert>
      ))}

      {/* Cancel and Create buttons */}
      <Button
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        onClick={() => history.goBack()}
      >
        Cancel
      </Button>
      <Button className={`${btnStyles.Button} ${btnStyles.Blue}`} type="submit">
        Create
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