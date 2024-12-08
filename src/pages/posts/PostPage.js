function PostPage() {
  const { id } = useParams();  // Get the post ID from the URL
  const [post, setPost] = useState({ results: [] });  // State to store the post data
  const [comments, setComments] = useState({ results: [] });  // State to store comments for the post

  const currentUser = useCurrentUser();  // Get the current logged-in user (if any)
  const profile_image = currentUser?.profile_image;  // Get the profile image of the current user

  useEffect(() => {
    const handleMount = async () => {
      try {
        // Fetch the post and its comments when the page is loaded
        const [{ data: post }, { data: comments }] = await Promise.all([
          axiosReq.get(`/posts/${id}`),  // Get the post by ID
          axiosReq.get(`/comments/?post=${id}`),  // Get the comments for the post
        ]);
        setPost({ results: [post] });  // Set the post data to state
        setComments(comments);  // Set the comments data to state
      } catch (err) {
        console.log(err);  // Log any error during the fetch
      }
    };

    handleMount();  // Call the function to fetch the data
  }, [id]);  // The effect runs again if the post ID changes (e.g., navigating to a different post)

  // Function to render hashtags from the post's add_hashtags field
  const renderHashtags = (hashtags) => {
    // Split the hashtags string by commas, remove spaces, and return them as clickable spans
    const hashtagsArray = hashtags.split(",").map((hashtag) => hashtag.trim());
    return hashtagsArray.map((hashtag, index) => (
      <span key={index} className="text-primary">
        #{hashtag}{" "}
      </span>
    ));
  };

  return (
    <Row className="h-100">
      {/* Left Column - Main content with post details */}
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        <PopularProfiles mobile /> {/* Display popular profiles in mobile view */}
        <Post {...post.results[0]} setPosts={setPost} postPage />  {/* Render the post with post data */}
        
        {/* Main content area for the post, including hashtags and comments */}
        <Container className={appStyles.Content}>
          {/* Display hashtags if they exist */}
          <div className="my-3">
            {post.results[0]?.add_hashtags && (
              <div>
                <strong>Hashtags: </strong>
                {renderHashtags(post.results[0].add_hashtags)}  {/* Render the hashtags */}
              </div>
            )}
          </div>

          {/* If the user is logged in, show the comment creation form */}
          {currentUser ? (
            <CommentCreateForm
              profile_id={currentUser.profile_id}  // Pass the current user's profile ID
              profileImage={profile_image}  // Pass the current user's profile image
              post={id}  // Pass the current post ID
              setPost={setPost}  // Pass the setPost function to update the post data
              setComments={setComments}  // Pass the setComments function to update the comments
            />
          ) : comments.results.length ? (
            "Comments"  // If the user is not logged in but there are comments, show "Comments"
          ) : null}

          {/* Display the list of comments for the post */}
          {comments.results.length ? (
            <InfiniteScroll
              children={comments.results.map((comment) => (
                <Comment
                  key={comment.id}
                  {...comment}
                  setPost={setPost}  // Pass setPost to update the post data after adding a comment
                  setComments={setComments}  // Pass setComments to update the comments data
                />
              ))}
              dataLength={comments.results.length}  // Pass the length of comments for scroll tracking
              loader={<Asset spinner />}  // Show a loading spinner while fetching comments
              hasMore={!!comments.next}  // Check if there are more comments to load
              next={() => fetchMoreData(comments, setComments)}  // Fetch more comments when the user scrolls
            />
          ) : currentUser ? (
            <span>No comments yet, be the first to comment!</span>  // If there are no comments and the user is logged in
          ) : (
            <span>No comments... yet</span>  // If there are no comments and the user is not logged in
          )}
        </Container>
      </Col>

      {/* Right Column - Popular profiles displayed on larger screens */}
      <Col lg={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />  {/* Show popular profiles */}
      </Col>
    </Row>
  );
}

export default PostsPage;