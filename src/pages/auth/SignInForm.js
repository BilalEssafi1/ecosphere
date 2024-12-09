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
import { setTokenTimestamp } from "../../utils/utils";

/**
 * SignInForm Component
 * 
 * This component handles user authentication through a login form.
 * It manages the sign-in process, including:
 * - Form state management for username and password
 * - API communication with the backend
 * - Error handling and display
 * - User redirection after successful login
 * - Token management
 */
function SignInForm() {
  // Context hook to update the logged-in user throughout the application
  const setCurrentUser = useSetCurrentUser();
  
  // Custom hook to redirect already logged-in users away from the login page
  useRedirect("loggedIn");

  // State to store form data (username and password)
  const [signInData, setSignInData] = useState({
    username: "",
    password: "",
  });
  
  // Destructure form data for easier access
  const { username, password } = signInData;
  
  // State to store and display any error messages
  const [errors, setErrors] = useState({});
  
  // Hook for programmatic navigation
  const history = useHistory();

  /**
   * Handle form submission
   * Attempts to authenticate the user and handles the login process
   * 
   * @param {Event} event - The form submission event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Log the login attempt for debugging
      console.log("Attempting login with:", { username });
      
      // Send login request to the backend
      const { data } = await axios.post("/dj-rest-auth/login/", signInData);
      console.log("Login response:", data);
      
      // Validate the response data
      if (!data || !data.user) {
        console.error("Invalid response data:", data);
        setErrors({ non_field_errors: ["Invalid response from server"] });
        return;
      }

      // Store authentication tokens in localStorage for persistent sessions
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      // Update the global user context
      setCurrentUser(data.user);
      
      // Set token timestamp for refresh token functionality
      setTokenTimestamp(data);

      // Add a small delay before redirect to ensure state updates are complete
      setTimeout(() => {
        history.goBack();
      }, 100);

    } catch (err) {
      // Log and handle any errors that occur during login
      console.error("Login error:", err.response?.data || err.message);
      setErrors(err.response?.data || { non_field_errors: [err.message] });
    }
  };

  /**
   * Handle input field changes
   * Updates the form state as the user types
   */
  const handleChange = (event) => {
    setSignInData({
      ...signInData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Row className={styles.Row}>
      {/* Left Column - Form Section */}
      <Col className="my-auto p-0 p-md-2" md={6}>
        <Container className={`${appStyles.Content} p-4`}>
          {/* Form Header */}
          <h1 className={styles.Header}>Sign In</h1>
          
          {/* Sign-in Form */}
          <Form onSubmit={handleSubmit}>
            {/* Username Input Field */}
            <Form.Group controlId="username">
              <Form.Label className="d-none">Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                name="username"
                className={styles.Input}
                value={username}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Display username-related errors */}
            {errors.username?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

            {/* Password Input Field */}
            <Form.Group controlId="password">
              <Form.Label className="d-none">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                className={styles.Input}
                value={password}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Display password-related errors */}
            {errors.password?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

            {/* Submit Button */}
            <Button
              className={`${btnStyles.Button} ${btnStyles.Wide} ${btnStyles.Bright}`}
              type="submit"
            >
              Sign In
            </Button>
            
            {/* Display non-field errors (general form errors) */}
            {errors.non_field_errors?.map((message, idx) => (
              <Alert key={idx} variant="warning" className="mt-3">
                {message}
              </Alert>
            ))}
          </Form>
        </Container>

        {/* Link to Sign Up page for new users */}
        <Container className={`mt-3 ${appStyles.Content}`}>
          <Link className={styles.Link} to="/signup">
            Don't have an account? <span>Sign up now!</span>
          </Link>
        </Container>
      </Col>

      {/* Right Column - Illustration Section */}
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
            maxHeight: "350px",
          }}
        />
      </Col>
    </Row>
  );
}

export default SignInForm;
