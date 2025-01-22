import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import styles from "../../styles/SignInUpForm.module.css";
import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";
import logoEcosphere from "../../assets/sign-up.jpg";
import {
  Form,
  Button,
  Image,
  Col,
  Row,
  Container,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useRedirect } from "../../hooks/useRedirect";
import { removeTokenTimestamp } from "../../utils/utils";

// Function to remove cookies with specific Heroku domain
const removeCookie = (name) => {
  // Get the current domain
  const domain = window.location.hostname;
  
  // Array of paths to try
  const paths = ['/', '/api', ''];
  
  // More comprehensive array of domain variations
  const domains = [
    domain,                                    // exact domain
    `.${domain}`,                             // with dot prefix
    domain.split('.').slice(1).join('.'),     // parent domain
    `.${domain.split('.').slice(1).join('.')}` // parent domain with dot prefix
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

const SignUpForm = () => {
  useRedirect("loggedIn");
  const [signUpData, setSignUpData] = useState({
    username: "",
    password1: "",
    password2: "",
  });
  const { username, password1, password2 } = signUpData;

  const [errors, setErrors] = useState({});

  const history = useHistory();

  const handleChange = (event) => {
    setSignUpData({
      ...signUpData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("/dj-rest-auth/registration/", signUpData);
      
      // Debug logging
      console.log('Cookies before cleanup:', document.cookie);

      // First clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeTokenTimestamp();

      // Get all existing cookies
      const allCookies = document.cookie.split(';').map(cookie => 
        cookie.split('=')[0].trim()
      );

      // Clear all authentication cookies
      const authCookies = [
        'csrftoken', 
        'sessionid', 
        'my-app-auth', 
        'my-refresh-token',
        'message'
      ];

      // Remove both known auth cookies and any others found
      [...new Set([...authCookies, ...allCookies])].forEach(cookieName => {
        removeCookie(cookieName);
      });

      console.log('Cookies after cleanup:', document.cookie);

      // Force a complete page reload before redirecting
      window.location.replace('/signin');
    } catch (err) {
      setErrors(err.response?.data);
    }
  };

  return (
    <Row className={styles.Row}>
      <Col className="my-auto py-2 p-md-2" md={6}>
        <Container className={`${appStyles.Content} p-4 `}>
          <h1 className={styles.Header}>sign up</h1>

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username">
              <Form.Label className="d-none">username</Form.Label>
              <Form.Control
                className={styles.Input}
                type="text"
                placeholder="Username"
                name="username"
                value={username}
                onChange={handleChange}
              />
            </Form.Group>
            {errors.username?.map((message, idx) => (
              <Alert variant="warning" key={idx}>
                {message}
              </Alert>
            ))}

            <Form.Group controlId="password1">
              <Form.Label className="d-none">Password</Form.Label>
              <Form.Control
                className={styles.Input}
                type="password"
                placeholder="Password"
                name="password1"
                value={password1}
                onChange={handleChange}
              />
            </Form.Group>
            {errors.password1?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

            <Form.Group controlId="password2">
              <Form.Label className="d-none">Confirm password</Form.Label>
              <Form.Control
                className={styles.Input}
                type="password"
                placeholder="Confirm password"
                name="password2"
                value={password2}
                onChange={handleChange}
              />
            </Form.Group>
            {errors.password2?.map((message, idx) => (
              <Alert key={idx} variant="warning">
                {message}
              </Alert>
            ))}

            <Button
              className={`${btnStyles.Button} ${btnStyles.Wide} ${btnStyles.Bright}`}
              type="submit"
            >
              Sign up
            </Button>
            {errors.non_field_errors?.map((message, idx) => (
              <Alert key={idx} variant="warning" className="mt-3">
                {message}
              </Alert>
            ))}
          </Form>
        </Container>

        <Container className={`mt-3 ${appStyles.Content}`}>
          <Link className={styles.Link} to="/signin">
            Already have an account? <span>Sign in</span>
          </Link>
        </Container>
      </Col>
      <Col
        md={6}
        className={`my-auto d-none d-md-block p-2 ${styles.SignUpCol}`}
      >
        <Image
          className={`${appStyles.FillerImage}`}
          src={logoEcosphere}
          style={{
            width: "100%",
            maxWidth: "700px",
            height: "100%",
            maxHeight: "350px" }}
        />
      </Col>
    </Row>
  );
};

export default SignUpForm;
