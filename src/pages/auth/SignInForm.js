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

// Function to remove cookies with specific Heroku domain
const removeCookie = (name) => {
  // Get the current domain
  const domain = window.location.hostname;
  
  // Array of paths to try
  const paths = ['/', '/api', ''];
  
  // More comprehensive array of domain variations
  const domains = [
    domain,
    `.${domain}`,
    domain.split('.').slice(1).join('.'),
    `.${domain.split('.').slice(1).join('.')}`
  ];

  // Array of cookie setting variations to try
  const cookieOptions = [
    // Basic removal
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    
    // Try all domain and path combinations
    ...domains.flatMap(d => 
      paths.map(p => 
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${d}; path=${p}`
      )
    ),
    
    // Secure and SameSite variations
    ...domains.flatMap(d => 
      paths.map(p => 
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${d}; path=${p}; secure; samesite=none`
      )
    ),

    // Additional variations without domain specification
    ...paths.map(p => 
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p}`
    )
  ];

  // Apply all cookie deletion variants
  cookieOptions.forEach(option => {
    document.cookie = option;
  });

  // Debug logging - check if cookie was actually removed
  const remainingCookie = document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${name}=`));

  if (remainingCookie) {
    console.warn(`Warning: Cookie '${name}' may still exist: ${remainingCookie}`);
  }
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

 /**
  * Effect to handle CSRF token setup
  * Clears old tokens and cookies before fetching new CSRF token
  */
  useEffect(() => {
    console.log('Cookies before cleanup:', document.cookie);

    // Clear all existing cookies first
    const allCookies = document.cookie.split(';').map(cookie => 
      cookie.split('=')[0].trim()
    );

    // Comprehensive list of cookies to remove
    const authCookies = [
      'csrftoken', 
      'sessionid', 
      'my-app-auth', 
      'my-refresh-token',
      'message',
      'messages',
      'cookieconsent_status',
      'token',
      'jwt',
      'auth_token'
    ];

    // Remove both known auth cookies and any others found
    [...new Set([...authCookies, ...allCookies])].forEach(cookieName => {
      if (cookieName) {
        console.log('Removing cookie:', cookieName);
        removeCookie(cookieName);
      }
    });

    console.log('Cookies after cleanup:', document.cookie);
  }, []);

  /**
   * Handles form submission for user login
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // First, get a fresh CSRF token
      await axios.get('/dj-rest-auth/user/', {
        withCredentials: true,
      });
      
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      console.log('Using CSRF token for login:', token);

      // Then attempt login with the fresh token
      const { data } = await axios.post("/dj-rest-auth/login/", signInData, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': token
        }
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
            >
              Sign In
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
