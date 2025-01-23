import React, { useState, useEffect } from "react";
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

// Enhanced cookie removal function
const removeCookie = (name) => {
  const cookieOptions = [
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=drf-api-green-social-61be33473742.herokuapp.com`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=drf-api-green-social-61be33473742.herokuapp.com; secure; samesite=none`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.herokuapp.com; secure; samesite=none`,
    // Additional paths to ensure complete cleanup
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api/`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dj-rest-auth/`,
  ];
  cookieOptions.forEach(option => {
    document.cookie = option;
  });
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear cookies and tokens on component mount
  useEffect(() => {
    const clearAuthState = async () => {
      // Clear all authentication-related cookies
      const cookiesToClear = [
        'csrftoken',
        'sessionid',
        'messages',
        'my-app-auth',
        'my-refresh-token',
        'my-app-refresh-token'
      ];
      
      cookiesToClear.forEach(cookieName => {
        removeCookie(cookieName);
      });

      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Wait a bit before fetching new CSRF token
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch new CSRF token
      try {
        await axios.get('/dj-rest-auth/user/', { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        // Ignore 401 errors as they're expected when not logged in
        if (err.response?.status !== 401) {
          console.error('Error fetching CSRF token:', err);
        }
      }
    };

    clearAuthState();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      // Clear existing auth state first
      const cookiesToClear = [
        'csrftoken',
        'sessionid',
        'messages',
        'my-app-auth',
        'my-refresh-token',
        'my-app-refresh-token'
      ];
      cookiesToClear.forEach(cookieName => {
        removeCookie(cookieName);
      });

      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get fresh CSRF token
      await axios.get('/dj-rest-auth/user/', { 
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Another short delay to ensure CSRF token is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Attempt login
      const { data } = await axios.post("/dj-rest-auth/login/", signInData, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      // Handle successful login
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      setCurrentUser(data.user);
      setTokenTimestamp(data);

      // Short delay before redirect
      setTimeout(() => {
        history.push("/posts");
      }, 100);

    } catch (err) {
      setErrors(err.response?.data || {
        non_field_errors: ["An error occurred. Please try again."],
      });
    } finally {
      setIsSubmitting(false);
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
      <Col className="my-auto p-0 p-md-2" md={6}>
        <Container className={`${appStyles.Content} p-4`}>
          <h1 className={styles.Header}>Sign In</h1>
          
          <Form onSubmit={handleSubmit}>
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
            {errors.username?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

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
            {errors.password?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

            <Button
              className={`${btnStyles.Button} ${btnStyles.Wide} ${btnStyles.Bright}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {errors.non_field_errors?.map((message, idx) => (
              <Alert key={idx} variant="warning" className="mt-3">
                {message}
              </Alert>
            ))}
          </Form>
        </Container>

        <Container className={`mt-3 ${appStyles.Content}`}>
          <Link className={styles.Link} to="/signup">
            Don't have an account? <span>Sign up now!</span>
          </Link>
        </Container>
      </Col>

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
