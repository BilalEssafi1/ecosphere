import React from "react";
import styles from "../../styles/Post.module.css";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { Card, Media, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";
import { MoreDropdown } from "../../components/MoreDropdown";

const Post = (props) => {
  const {
    id,
    owner,
    profile_id,
    profile_image,
    comments_count,
    likes_count,
    like_id,
    title,
    content,
    image,
    updated_at,
    postPage,
    setPosts,
    tags,
  } = props;

  const currentUser = useCurrentUser();  // Get the current logged-in user
  const is_owner = currentUser?.username === owner;  // Check if the current user is the owner of the post
  const history = useHistory();  // React Router hook for navigation

  // Handle post edit (navigate to edit page for this post)
  const handleEdit = () => {
    history.push(`/posts/${id}/edit`);
  };

  // Handle post delete (make an API call to delete the post)
  const handleDelete = async () => {
    try {
      await axiosRes.delete(`/posts/${id}/`);  // Make DELETE request to remove the post
      history.goBack();  // Navigate the user back after deletion
    } catch (err) {
      console.log(err);  // Log any errors
    }
  };

  // Handle like action (send a POST request to like the post)
  const handleLike = async () => {
    try {
      const { data } = await axiosRes.post("/likes/", { post: id });  // Create a new like
      // Update the state in parent component (to reflect the new likes count)
      setPosts((prevPosts) => ({
        ...prevPosts,
        results: prevPosts.results.map((post) => {
          return post.id === id
            ? { ...post, likes_count: post.likes_count + 1, like_id: data.id }
            : post;
        }),
      }));
    } catch (err) {
      console.log(err);  // Log any errors
    }
  };

  // Handle unlike action (send a DELETE request to remove the like)
  const handleUnlike = async () => {
    try {
      await axiosRes.delete(`/likes/${like_id}/`);  // Delete the like using like_id
      // Update the state in parent component (to reflect the new likes count)
      setPosts((prevPosts) => ({
        ...prevPosts,
        results: prevPosts.results.map((post) => {
          return post.id === id
            ? { ...post, likes_count: post.likes_count - 1, like_id: null }
            : post;
        }),
      }));
    } catch (err) {
      console.log(err);  // Log any errors
    }
  };

  // Function to render hashtags correctly (either from tags array or comma-separated string)
  const renderHashtags = () => {
    // Check if tags is an array
    if (Array.isArray(tags)) {
      return tags.map((tag, index) => (
        <span key={index} className="text-primary">
          #{tag.name}{" "}  {/* Render each hashtag with # symbol */}
        </span>
      ));
    }
    // If tags is a string (comma-separated input from `add_hashtags`)
    if (typeof tags === "string") {
      const hashtagsArray = tags.split(",").map((tag) => tag.trim());  // Split string into an array
      return hashtagsArray.map((hashtag, index) => (
        <span key={index} className="text-primary">
          #{hashtag}{" "}  {/* Render each hashtag with # symbol */}
        </span>
      ));
    }
    return null;  // Return null if no hashtags exist
  };

  return (
    <Card className={styles.Post}>
      <Card.Body>
        {/* Media section for post header (profile and post info) */}
        <Media className="align-items-center justify-content-between">
          <Link to={`/profiles/${profile_id}`}>
            <Avatar src={profile_image} height={55} /> {/* Display the profile image */}
            {owner}  {/* Display the username of the post owner */}
          </Link>
          <div className="d-flex align-items-center">
            <span>{updated_at}</span>  {/* Display the updated timestamp */}
            {is_owner && postPage && (
              <MoreDropdown
                handleEdit={handleEdit}  // Edit post option
                handleDelete={handleDelete}  // Delete post option
              />
            )}
          </div>
        </Media>
      </Card.Body>
      <Link to={`/posts/${id}`}>
        <Card.Img src={image} alt={title} />  {/* Display the post image */}
      </Link>
      <Card.Body>
        {title && <Card.Title className="text-center">{title}</Card.Title>}  {/* Render post title */}
        {content && <Card.Text>{content}</Card.Text>}  {/* Render post content */}
        
        {/* Render hashtags section */}
        <div>
          {tags && (
            <div>
              <strong>Hashtags: </strong>
              {renderHashtags()}  {/* Render hashtags using the renderHashtags function */}
            </div>
          )}
        </div>

        {/* Post actions (like, comment, etc.) */}
        <div className={styles.PostBar}>
          {/* Prevent liking your own post */}
          {is_owner ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>You can't like your own post!</Tooltip>}
            >
              <i className="far fa-heart" />  {/* Disabled like icon */}
            </OverlayTrigger>
          ) : like_id ? (
            // If the user has already liked the post, allow unliking
            <span onClick={handleUnlike}>
              <i className={`fas fa-heart ${styles.Heart}`} />  {/* Active like icon */}
            </span>
          ) : currentUser ? (
            // If the user hasn't liked the post, allow liking
            <span onClick={handleLike}>
              <i className={`far fa-heart ${styles.HeartOutline}`} />  {/* Outline like icon */}
            </span>
          ) : (
            // If the user is not logged in, show a tooltip
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Log in to like posts!</Tooltip>}
            >
              <i className="far fa-heart" />  {/* Disabled like icon */}
            </OverlayTrigger>
          )}
          {likes_count}  {/* Display the number of likes */}
          <Link to={`/posts/${id}`}>
            <i className="far fa-comments" />  {/* Comments icon */}
          </Link>
          {comments_count}  {/* Display the number of comments */}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Post;
