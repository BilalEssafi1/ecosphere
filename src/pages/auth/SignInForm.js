import React, { useState } from "react";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";
import { Link, useHistory } from "react-router-dom";
import styles from "../../styles/SignInUpForm.module.css";
import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";
import SignInImage from "../../assets/sign-in.jpg";
import { useSetCurrentUser } from "../../contexts/CurrentUserContext";
import { useRedirect } from "../../hooks/useRedirect";

// Configure axios defaults for cross-origin requests and CSRF protection
// withCredentials: true enables sending cookies in cross-origin requests
// xsrfCookieName and xsrfHeaderName configure CSRF token handling
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

function SignInForm() {
  // Get the function to update the current user from context
  const setCurrentUser = useSetCurrentUser();
  // Redirect logged-in users away from this page
  useRedirect("loggedIn");

  // State for form data
  const [signInData, setSignInData] = useState({
    username: "",
    password: "",
  });
  const { username, password } = signInData;

  // State for handling form errors and loading state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();
  
  /**
   * Handle form submission
   * - Prevents default form submission
   * - Sends login request to the backend
   * - Stores authentication token
   * - Updates current user
   * - Handles errors
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Send login request to the backend
      const { data } = await axios.post("/dj-rest-auth/login/", signInData);
      
      // If login successful, store the authentication token
      if (data.key) {
        localStorage.setItem("token", data.key);
        // Set the default Authorization header for all future requests
        axios.defaults.headers.common["Authorization"] = `Token ${data.key}`;
      }
      
      // Update the current user in the app context
      setCurrentUser(data.user);
      // Navigate back to the previous page
      history.goBack();
    } catch (err) {
      // Handle any errors from the login attempt
      setErrors(err.response?.data || {
        non_field_errors: ["An error occurred. Please try again."]
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form input changes
   * Updates the signInData state when form fields change
   */
  const handleChange = (event) => {
    setSignInData({
      ...signInData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Row className={styles.Row}>
      <Col className="my-auto p-0 p-md-2" md={6}>
        <Container className={`${appStyles.Content} p-4 `}>
          <h1 className={styles.Header}>sign in</h1>
          {/* Login form */}
          <Form onSubmit={handleSubmit}>
            {/* Username field */}
            <Form.Group controlId="username">
              <Form.Label className="d-none">Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                name="username"
                className={styles.Input}
                value={username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Form.Group>
            {/* Username error messages */}
            {errors.username?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

            {/* Password field */}
            <Form.Group controlId="password">
              <Form.Label className="d-none">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                className={styles.Input}
                value={password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Form.Group>
            {/* Password error messages */}
            {errors.password?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}
            {/* Submit button */}
            <Button
              className={`${btnStyles.Button} ${btnStyles.Wide} ${btnStyles.Bright}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            {/* General error messages */}
            {errors.non_field_errors?.map((message, idx) => (
              <Alert key={idx} variant="warning" className="mt-3">
                {message}
              </Alert>
            ))}
          </Form>
        </Container>
        {/* Sign up link */}
        <Container className={`mt-3 ${appStyles.Content}`}>
          <Link className={styles.Link} to="/signup">
            Don't have an account? <span>Sign up now!</span>
          </Link>
        </Container>
      </Col>
      {/* Decorative image column */}
      <Col
        md={6}
        className={`my-auto d-none d-md-block p-2 ${styles.SignInCol}`}
      >
        <Image
          className={`${appStyles.FillerImage}`}
          src={SignInImage}
          style={{
            width: "100%",
            maxWidth: "700px",
            height: "100%",
            maxHeight: "350px"
          }}
        />
      </Col>
    </Row>
  );
}

export default SignInForm;