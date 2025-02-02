import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
* Handles user authentication and login process
* Includes error handling, token management, and CSRF protection
*/
function SignInForm() {
const setCurrentUser = useSetCurrentUser();
useRedirect("loggedIn");
const history = useHistory();

const [signInData, setSignInData] = useState({
  username: "",
  password: "",
});
const { username, password } = signInData;
const [errors, setErrors] = useState({});

/**
 * Effect to handle CSRF token setup
 * Clears old token and fetches new one on component mount
 */
useEffect(() => {
  // Clear old CSRF token and fetch new one
  Cookies.remove('csrftoken');
  axios.get('/dj-rest-auth/user/', { withCredentials: true })
    .catch(() => {
    });
}, []);

/**
 * Handles form submission for user login
 * Includes CSRF token and authentication token management
 */
const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    // Make login request with CSRF token
    const { data } = await axios.post("/dj-rest-auth/login/", signInData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": Cookies.get('csrftoken'),
      },
    });

    // Handle successful login
    if (data.access) {
      localStorage.setItem("access_token", data.access);
    }
    if (data.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    }

    // Update user context and redirect
    setCurrentUser(data.user);
    setTokenTimestamp(data);
    history.push("/posts");
   
  } catch (err) {
    setErrors(err.response?.data || {
      non_field_errors: ["An error occurred. Please try again."],
    });
  }
};

/**
 * Handles form input changes
 * Updates form state as user types
 */
const handleChange = (event) => {
  setSignInData({
    ...signInData,
    [event.target.name]: event.target.value,
  });
};

return (
  <Row className={styles.Row}>
    {/* Form Column */}
    <Col className="my-auto p-0 p-md-2" md={6}>
      <Container className={`${appStyles.Content} p-4`}>
        <h1 className={styles.Header}>Sign In</h1>
       
        <Form onSubmit={handleSubmit}>
          {/* Username Field */}
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
          {/* Username Errors */}
          {errors.username?.map((message, idx) => (
            <Alert key={idx} variant="warning">
              {message}
            </Alert>
          ))}

          {/* Password Field */}
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
          {/* Password Errors */}
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


          {/* General Form Errors */}
          {errors.non_field_errors?.map((message, idx) => (
            <Alert key={idx} variant="warning" className="mt-3">
              {message}
            </Alert>
          ))}
        </Form>
      </Container>


      {/* Sign Up Link */}
      <Container className={`mt-3 ${appStyles.Content}`}>
        <Link className={styles.Link} to="/signup">
          Don't have an account? <span>Sign up now!</span>
        </Link>
      </Container>
    </Col>


    {/* Image Column */}
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
