import React, { useState } from "react";
import { Media } from "react-bootstrap";
import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { MoreDropdown } from "../../components/MoreDropdown";
import CommentEditForm from "./CommentEditForm";
import styles from "../../styles/Comment.module.css";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { axiosRes } from "../../api/axiosDefaults";

/**
* Displays individual comments with edit/delete functionality for owners
* Includes user avatar, comment content, and timestamp
*/
const Comment = (props) => {
 const {
   profile_id,
   profile_image,
   owner,
   updated_at,
   content,
   id,
   setPost,
   setComments,
 } = props;

 // State to toggle comment edit form
 const [showEditForm, setShowEditForm] = useState(false);
 // Get current user context for ownership checks
 const currentUser = useCurrentUser();
 // Check if current user owns this comment
 const is_owner = currentUser?.username === owner;

 /**
  * Handles comment deletion
  * Updates post comment count and comments list
  */
 const handleDelete = async () => {
   try {
     // Delete comment via API
     await axiosRes.delete(`/comments/${id}/`);
     
     // Update post comments count
     setPost((prevPost) => ({
       results: [
         {
           ...prevPost.results[0],
           comments_count: prevPost.results[0].comments_count - 1,
         },
       ],
     }));

     // Remove comment from comments list
     setComments((prevComments) => ({
       ...prevComments,
       results: prevComments.results.filter((comment) => comment.id !== id),
     }));
   } catch (err) {
   }
 };

 return (
   <>
     <hr />
     <Media>
       {/* Link to commenter's profile with avatar */}
       <Link to={`/profiles/${profile_id}`}>
         <Avatar src={profile_image} />
       </Link>
       <Media.Body className="align-self-center ml-2">
         {/* Comment owner name and timestamp */}
         <span className={styles.Owner}>{owner}</span>
         <span className={styles.Date}>{updated_at}</span>
         {/* Show edit form or comment content */}
         {showEditForm ? (
           <CommentEditForm
             id={id}
             profile_id={profile_id}
             content={content}
             profileImage={profile_image}
             setComments={setComments}
             setShowEditForm={setShowEditForm}
           />
         ) : (
           <p>{content}</p>
         )}
       </Media.Body>
       {/* Show edit/delete dropdown for comment owners */}
       {is_owner && !showEditForm && (
         <MoreDropdown
           handleEdit={() => setShowEditForm(true)}
           handleDelete={handleDelete}
         />
       )}
     </Media>
   </>
 );
};

export default Comment;
