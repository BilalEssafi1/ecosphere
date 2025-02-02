import React from "react";
import styles from "../../styles/Post.module.css";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { Card, Media, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";
import { MoreDropdown } from "../../components/MoreDropdown";
import BookmarkButton from "../../components/BookmarkButton";

/**
* Displays individual posts with like, comment and bookmark functionality
* Handles post editing and deletion for post owners
*/
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

 // Get current user context and check ownership
 const currentUser = useCurrentUser();
 const is_owner = currentUser?.username === owner;
 const history = useHistory();

 /**
  * Navigates to post edit page
  */
 const handleEdit = () => {
   history.push(`/posts/${id}/edit`);
 };

 /**
  * Handles post deletion
  * Redirects user after successful deletion
  */
 const handleDelete = async () => {
   try {
     await axiosRes.delete(`/posts/${id}/`);
     history.goBack();
   } catch (err) {
   }
 };

 /**
  * Handles liking a post
  * Updates post likes count and like_id
  */
 const handleLike = async () => {
   try {
     const { data } = await axiosRes.post("/likes/", { post: id });
     setPosts((prevPosts) => ({
       ...prevPosts,
       results: prevPosts.results.map((post) => {
         return post.id === id
           ? { ...post, likes_count: post.likes_count + 1, like_id: data.id }
           : post;
       }),
     }));
   } catch (err) {
   }
 };

 /**
  * Handles unliking a post
  * Updates post likes count and removes like_id
  */
 const handleUnlike = async () => {
   try {
     await axiosRes.delete(`/likes/${like_id}/`);
     setPosts((prevPosts) => ({
       ...prevPosts,
       results: prevPosts.results.map((post) => {
         return post.id === id
           ? { ...post, likes_count: post.likes_count - 1, like_id: null }
           : post;
       }),
     }));
   } catch (err) {
   }
 };

 return (
   <Card className={styles.Post}>
     <Card.Body>
       {/* Post header with user info and options */}
       <Media className="align-items-center justify-content-between">
         <Link to={`/profiles/${profile_id}`}>
           <Avatar src={profile_image} height={55} />
           {owner}
         </Link>
         <div className="d-flex align-items-center">
           <span>{updated_at}</span>
           {is_owner && postPage && (
             <MoreDropdown
               handleEdit={handleEdit}
               handleDelete={handleDelete}
             />
           )}
         </div>
       </Media>
     </Card.Body>
     
     {/* Post image */}
     <Link to={`/posts/${id}`}>
       <Card.Img src={image} alt={title} />
     </Link>
     
     <Card.Body>
       {/* Post title and content */}
       {title && <Card.Title className="text-center">{title}</Card.Title>}
       {content && <Card.Text>{content}</Card.Text>}
       
       {/* Hashtags display */}
       {tags && tags.length > 0 && (
         <div className={styles.Tags}>
           {tags.map((tag, index) => (
             <span key={index} className={styles.Tag}>
               {tag}
             </span>
           ))}
         </div>
       )}

       {/* Post interaction bar */}
       <div className={styles.PostBar}>
         {/* Like functionality with different states */}
         {is_owner ? (
           <OverlayTrigger
             placement="top"
             overlay={<Tooltip>You can't like your own post!</Tooltip>}
           >
             <i className="far fa-heart" />
           </OverlayTrigger>
         ) : like_id ? (
           <span onClick={handleUnlike}>
             <i className={`fas fa-heart ${styles.Heart}`} />
           </span>
         ) : currentUser ? (
           <span onClick={handleLike}>
             <i className={`far fa-heart ${styles.HeartOutline}`} />
           </span>
         ) : (
           <OverlayTrigger
             placement="top"
             overlay={<Tooltip>Log in to like posts!</Tooltip>}
           >
             <i className="far fa-heart" />
           </OverlayTrigger>
         )}
         {likes_count}
         
         {/* Comments link and count */}
         <Link to={`/posts/${id}`}>
           <i className="far fa-comments" />
         </Link>
         {comments_count}
         
         {/* Bookmark functionality */}
         <BookmarkButton post={{ id, is_bookmarked: false }} currentUser={currentUser} />
       </div>
     </Card.Body>
   </Card>
 );
};

export default Post;
