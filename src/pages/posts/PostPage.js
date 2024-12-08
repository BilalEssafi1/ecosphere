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
    // Return null if hashtags is undefined, null, or not a string
    if (!hashtags || typeof hashtags !== 'string') {
      console.log('Hashtags is not a string:', hashtags);
      return null;
    }
    
    try {
      // Split hashtags string into array and trim whitespace
      const hashtagsArray = hashtags.split(",").map((hashtag) => hashtag.trim());
      // Map each hashtag to a styled span element
      return hashtagsArray.map((hashtag, index) => (
        <span key={index} className="text-primary">
          #{hashtag}{" "}
        </span>
      ));
    } catch (error) {
      // Log any errors that occur during hashtag processing
      console.log('Error processing hashtags:', error);
      return null;
    }
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
          // Show post content if data is loaded successfully
          <>
            {/* Render the post component */}
            <Post {...post} setPosts={setPost} postPage />
            
            {/* Container for hashtags and comments */}
            <Container className={appStyles.Content}>
              {/* Hashtags section - only render if hashtags exist and are valid */}
              <div className="my-3">
                {hashtags && typeof hashtags === 'string' && (
                  <div>
                    <strong>Hashtags: </strong>
                    {renderHashtags(hashtags)}
                  </div>
                )}
              </div>

              {/* Comments section - show different content based on user login status */}
              {currentUser ? (
                // Show comment form if user is logged in
                <CommentCreateForm
                  profile_id={currentUser.profile_id}
                  profileImage={profile_image}
                  post={id}
                  setPost={setPost}
                  setComments={setComments}
                />
              ) : comments.results.length ? (
                // Show "Comments" text if user is not logged in but there are comments
                "Comments"
              ) : null}

              {/* Comments display section */}
              {comments.results.length ? (
                // Show infinite scroll with comments if there are any
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
                // Show message for logged-in users when no comments exist
                <span>No comments yet, be the first to comment!</span>
              ) : (
                // Show message for non-logged-in users when no comments exist
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
