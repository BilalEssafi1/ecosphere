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

function SignInForm() {
  const setCurrentUser = useSetCurrentUser(); // Setter function to update the current user context
  useRedirect("loggedIn"); // Redirect logged-in users away from the sign-in page

  const [signInData, setSignInData] = useState({
    username: "",
    password: "",
  }); // State to store username and password inputs

  const { username, password } = signInData; // Destructure the input fields from the state

  const [errors, setErrors] = useState({}); // State to store error messages

  const history = useHistory(); // React Router's useHistory hook for navigation

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      // Send a POST request to the login endpoint with the sign-in data
      const { data } = await axios.post("/dj-rest-auth/login/", signInData);

      // If successful, update the current user context
      setCurrentUser(data.user);

      // Redirect the user to the homepage after login
      history.push("/");
    } catch (err) {
      // If there's an error, update the errors state with the response data
      setErrors(err.response?.data || {});
    }
  };

  // Handle input field changes
  const handleChange = (event) => {
    const { name, value } = event.target; // Destructure the name and value from the event
    setSignInData({
      ...signInData, // Spread the existing state
      [name]: value, // Update the specific field being changed
    });
  };

  // JSX for the component
  return (
    <Row className={styles.Row}>
      {/* Left Column - Form Section */}
      <Col className="my-auto p-0 p-md-2" md={6}>
        <Container className={`${appStyles.Content} p-4`}>
          {/* Header */}
          <h1 className={styles.Header}>Sign In</h1>

          {/* Sign-in Form */}
          <Form onSubmit={handleSubmit}>
            {/* Username Input */}
            <Form.Group controlId="username">
              <Form.Label className="d-none">Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                name="username"
                className={styles.Input}
                value={username}
                onChange={handleChange} // Update the state on input change
              />
            </Form.Group>
            {/* Display errors for username if any */}
            {errors.username?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

            {/* Password Input */}
            <Form.Group controlId="password">
              <Form.Label className="d-none">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                className={styles.Input}
                value={password}
                onChange={handleChange} // Update the state on input change
              />
            </Form.Group>
            {/* Display errors for password if any */}
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
            {/* Display non-field errors if any */}
            {errors.non_field_errors?.map((message, idx) => (
              <Alert key={idx} variant="warning" className="mt-3">
                {message}
              </Alert>
            ))}
          </Form>
        </Container>

        {/* Sign-Up Link */}
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
