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
import NoResults from "../../assets/no-results.png";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchMoreData } from "../../utils/utils";
import PopularProfiles from "../profiles/PopularProfiles";

function PostsPage({ message, filter = "" }) {
  // State Management
  const [posts, setPosts] = useState({ results: [] });  // Store posts data
  const [hasLoaded, setHasLoaded] = useState(false);   // Track loading state
  const { pathname } = useLocation();                  // Get current path
  const [query, setQuery] = useState("");              // Store search query

  useEffect(() => {
    // Create AbortController for cleanup
    const controller = new AbortController();

    /**
     * Fetches posts from the API based on current filter and search query
     * Updates posts state and loading status
     */
    const fetchPosts = async () => {
      try {
        const { data } = await axiosReq.get(
          `/posts/?${filter}search=${query}`,
          { signal: controller.signal }
        );
        setPosts(data);
        setHasLoaded(true);
      } catch (err) {
        // Only log error if request wasn't aborted
        if (!controller.signal.aborted) {
          console.log(err);
        }
      }
    };

    // Reset loading state before fetching
    setHasLoaded(false);
    
    // Add delay to prevent too many API requests while typing
    const timer = setTimeout(() => {
      fetchPosts();
    }, 1000);

    // Cleanup function to prevent memory leaks
    return () => {
      controller.abort(); // Abort any pending requests
      clearTimeout(timer); // Clear the timeout
    };
  }, [filter, query, pathname]); // Re-run effect when these dependencies change

  return (
    <Row className="h-100">
      {/* Main Content Column */}
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        {/* Show popular profiles on mobile */}
        <PopularProfiles mobile />

        {/* Search Bar Section */}
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

        {/* Posts Display Section */}
        {hasLoaded ? (
          <>
            {posts.results.length ? (
              // Infinite scroll for posts list
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
              // Display no results message
              <Container className={appStyles.Content}>
                <Asset src={NoResults} message={message} />
              </Container>
            )}
          </>
        ) : (
          // Display loading spinner while fetching
          <Container className={appStyles.Content}>
            <Asset spinner />
          </Container>
        )}
      </Col>

      {/* Sidebar Column - Popular Profiles */}
      <Col md={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />
      </Col>
    </Row>
  );
}

export default PostsPage;