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
import { useCurrentUser } from "../../contexts/CurrentUserContext";

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
  const currentUser = useCurrentUser();

  // Add state for bookmark folders and check if on bookmarks page
  const [folders, setFolders] = useState([]);
  const isBookmarksPage = pathname === "/bookmarks";

  useEffect(() => {
    const controller = new AbortController();

    /**
     * Fetches bookmark folders for the current user
     * Only called when on the bookmarks page
     */
    const fetchFolders = async () => {
      try {
        const { data } = await axiosReq.get("/folders/");
        setFolders(data.results);
      } catch (err) {
        console.log("Fetch folders error:", err);
      }
    };

    /**
     * Fetches posts from the API with authentication
     * Handles token refresh if needed
     */
    const fetchPosts = async () => {
      try {
        // Only add auth header if we're on a protected route
        const config = {
          signal: controller.signal,
        };

        if (isBookmarksPage) {
          const token = localStorage.getItem("access_token");
          config.headers = { Authorization: `Bearer ${token}` };
        }

        const { data } = await axiosReq.get(
          `/posts/?${filter}search=${query}`,
          config
        );
        setPosts(data);
        setHasLoaded(true);

        // Fetch folders if on bookmarks page
        if (isBookmarksPage) {
          await fetchFolders();
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.log("Fetch posts error:", err);
          setHasLoaded(true);
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
  }, [filter, query, pathname, currentUser, isBookmarksPage]);

  /**
   * Renders posts either grouped by folders (bookmarks page)
   * or in standard list view (other pages)
   */
  const renderPosts = () => {
    if (isBookmarksPage) {
      return (
        <Container>
          {folders.map((folder) => (
            <div key={folder.id} className={styles.BookmarkFolder}>
              <h3 className={styles.FolderTitle}>{folder.name}</h3>
              <div className={styles.FolderPosts}>
                {posts.results
                  .filter((post) => post.bookmark_id && post.folder === folder.id)
                  .map((post) => (
                    <Post key={post.id} {...post} setPosts={setPosts} />
                  ))}
              </div>
            </div>
          ))}
        </Container>
      );
    }

    return (
      <InfiniteScroll
        children={posts.results.map((post) => (
          <Post key={post.id} {...post} setPosts={setPosts} />
        ))}
        dataLength={posts.results.length}
        loader={<Asset spinner />}
        hasMore={!!posts.next}
        next={() => fetchMoreData(posts, setPosts)}
      />
    );
  };

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
              renderPosts()
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