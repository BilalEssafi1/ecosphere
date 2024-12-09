import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Post from "./Post";
import Asset from "../../components/Asset";
import appStyles from "../../App.module.css";
import styles from "../../styles/PostsPage.module.css";
import { useLocation } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";
import axios from "axios";
import NoResults from "../../assets/no-results.png";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchMoreData } from "../../utils/utils";
import PopularProfiles from "../profiles/PopularProfiles";

/**
 * PostsPage Component
 * Displays a list of posts with search, filter, and infinite scroll functionality
 */
function PostsPage({ message, filter = "" }) {
  // Initialize states for posts, loading status, and search
  const [posts, setPosts] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    /**
     * Fetches posts from the API with authentication
     * Handles token refresh if needed
     */
    const fetchPosts = async () => {
      try {
        // Get authentication token
        const token = localStorage.getItem("access_token");

        // Make authenticated request
        const { data } = await axiosReq.get(
          `/posts/?${filter}search=${query}`,
          { 
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setPosts(data);
        setHasLoaded(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          // Handle authentication errors
          if (err.response?.status === 401) {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
              try {
                // Attempt token refresh
                const response = await axios.post("/dj-rest-auth/token/refresh/", {
                  refresh: refreshToken
                });
                localStorage.setItem("access_token", response.data.access);
                // Retry the original request
                fetchPosts();
              } catch (refreshErr) {
                console.log("Token refresh failed:", refreshErr);
              }
            }
          }
          console.log("Fetch posts error:", err);
        }
      }
    };

    // Reset loading state and add delay for search
    setHasLoaded(false);
    const timer = setTimeout(() => {
      fetchPosts();
    }, 1000);

    // Cleanup function
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [filter, query, pathname]);

  return (
    <Row className="h-100">
      {/* Main content column */}
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        <PopularProfiles mobile />

        {/* Search functionality */}
        <i className={`fas fa-search ${styles.SearchIcon}`} />
        <Form
          className={styles.SearchBar}
          onSubmit={(event) => event.preventDefault()}
        >
          <Form.Control
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            className="mr-sm-2"
            placeholder="Search posts"
          />
        </Form>

        {/* Posts display with loading states */}
        {hasLoaded ? (
          <>
            {posts.results.length ? (
              <InfiniteScroll
                children={posts.results.map((post) => (
                  <Post key={post.id} {...post} setPosts={setPosts} />
                ))}
                dataLength={posts.results.length}
                loader={<Asset spinner />}
                hasMore={!!posts.next}
                next={() => fetchMoreData(posts, setPosts)}
              />
            ) : (
              <Container className={appStyles.Content}>
                <Asset src={NoResults} message={message} />
              </Container>
            )}
          </>
        ) : (
          <Container className={appStyles.Content}>
            <Asset spinner />
          </Container>
        )}
      </Col>

      {/* Popular profiles sidebar */}
      <Col md={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />
      </Col>
    </Row>
  );
}

export default PostsPage;