import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import appStyles from "../../App.module.css";
import { useParams } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";
import Post from "./Post";
import Comment from "../comments/Comment";
import CommentCreateForm from "../comments/CommentCreateForm";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import InfiniteScroll from "react-infinite-scroll-component";
import Asset from "../../components/Asset";
import { fetchMoreData } from "../../utils/utils";
import PopularProfiles from "../profiles/PopularProfiles";

function PostPage() {
  // Get the post ID from the URL parameters
  const { id } = useParams();
  // State for storing the post data
  const [post, setPost] = useState(null);
  // State for storing comments data, initialized with empty results array
  const [comments, setComments] = useState({ results: [] });
  // State for handling any errors that occur
  const [errors, setErrors] = useState({});
  // State for tracking loading status
  const [loading, setLoading] = useState(true);

  // Get the current user and their profile image from context
  const currentUser = useCurrentUser();
  const profile_image = currentUser?.profile_image;

  // Effect hook to fetch post and comments data when component mounts or ID changes
  useEffect(() => {
    const handleMount = async () => {
      try {
        // Set loading state while fetching data
        setLoading(true);
        // Fetch both post and comments data simultaneously
        const [{ data: post }, { data: comments }] = await Promise.all([
          axiosReq.get(`/posts/${id}`),
          axiosReq.get(`/comments/?post=${id}`),
        ]);
        // Debug log to check post data structure
        console.log("Post data:", post);
        // Update state with fetched data
        setPost(post);
        setComments(comments);
      } catch (err) {
        // Log any errors that occur during fetch
        console.log("Error:", err);
        // Store any error responses
        setErrors(err.response?.data || {});
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    };

    handleMount();
  }, [id]); // Re-run effect if post ID changes

  // Function to render hashtags from a string with error handling
  const renderHashtags = (hashtags) => {
    // Check if hashtags is an array (from post.tags), and render tags
    if (Array.isArray(hashtags)) {
      return hashtags.map((hashtag, index) => (
        <span key={index} className="text-primary">
          #{hashtag.name}{" "}
        </span>
      ));
    }

    // If hashtags is a string (from post.add_hashtags), split and render them
    if (typeof hashtags === "string") {
      const hashtagsArray = hashtags.split(",").map((hashtag) => hashtag.trim()); // Split string into individual hashtags
      return hashtagsArray.map((hashtag, index) => (
        <span key={index} className="text-primary">
          #{hashtag}{" "}
        </span>
      ));
    }

    return null; // Return null if there are no hashtags
  };

  // Check both possible hashtag fields and provide default empty string
  const hashtags = post?.tags || post?.add_hashtags || "";

  return (
    <Row className="h-100">
      {/* Main content column */}
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        {/* Show popular profiles for mobile view */}
        <PopularProfiles mobile />
        
        {/* Conditional rendering based on loading and error states */}
        {loading ? (
          // Show loading spinner while fetching data
          <Container className={appStyles.Content}>
            <Asset spinner />
          </Container>
        ) : errors?.detail ? (
          // Show error message if there's an error
          <Container className={appStyles.Content}>
            <Asset message={errors.detail} />
          </Container>
        ) : post ? (
          <>
            {/* Render the post component */}
            <Post {...post} setPosts={setPost} postPage />

            {/* Hashtags section - render right after the post content */}
            <Container className={appStyles.Content}>
              <div className="my-3">
                {/* Render hashtags only if they exist and are valid */}
                {hashtags && (Array.isArray(hashtags) || typeof hashtags === 'string') && (
                  <div>
                    <strong>Hashtags: </strong>
                    {renderHashtags(hashtags)} {/* Render hashtags here */}
                  </div>
                )}
              </div>

              {/* Comments section */}
              {currentUser ? (
                <CommentCreateForm
                  profile_id={currentUser.profile_id}
                  profileImage={profile_image}
                  post={id}
                  setPost={setPost}
                  setComments={setComments}
                />
              ) : comments.results.length ? (
                "Comments"
              ) : null}

              {/* Display Comments */}
              {comments.results.length ? (
                <InfiniteScroll
                  children={comments.results.map((comment) => (
                    <Comment
                      key={comment.id}
                      {...comment}
                      setPost={setPost}
                      setComments={setComments}
                    />
                  ))}
                  dataLength={comments.results.length}
                  loader={<Asset spinner />}
                  hasMore={!!comments.next}
                  next={() => fetchMoreData(comments, setComments)}
                />
              ) : currentUser ? (
                <span>No comments yet, be the first to comment!</span>
              ) : (
                <span>No comments... yet</span>
              )}
            </Container>
          </>
        ) : null}
      </Col>

      {/* Popular profiles column - only shown on larger screens */}
      <Col lg={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />
      </Col>
    </Row>
  );
}

export default PostPage;
