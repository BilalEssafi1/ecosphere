import React, { useState } from "react";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import styles from "../../styles/CommentCreateEditForm.module.css";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";

/**
* Handles creation of new comments on posts
* Includes form validation and submission handling
*/
function CommentCreateForm(props) {
 // Destructure props needed for comment creation
 const { post, setPost, setComments, profileImage, profile_id } = props;
 // State for comment content
 const [content, setContent] = useState("");

 /**
  * Handles changes to comment input field
  * Updates content state as user types
  */
 const handleChange = (event) => {
   setContent(event.target.value);
 };

 /**
  * Handles form submission for creating new comment
  * Makes API request and updates post and comments state
  */
 const handleSubmit = async (event) => {
   event.preventDefault();
   try {
     const { data } = await axiosRes.post("/comments/", {
       content,
       post,
     });

     // Update comments list with new comment
     setComments((prevComments) => ({
       ...prevComments,
       results: data ? [data, ...prevComments.results] : prevComments.results,
     }));

     // Update post comment count
     setPost((prevPost) => ({
       results: [{
         ...prevPost.results[0],
         comments_count: prevPost.results[0].comments_count + 1,
       }],
     }));

     // Clear comment input after successful submission
     setContent("");
   } catch (err) {
     // Error handled silently to maintain user experience
   }
 };

 return (
   <Form className="mt-2" onSubmit={handleSubmit}>
     <Form.Group>
       <InputGroup>
         {/* Link to commenter's profile */}
         <Link to={`/profiles/${profile_id}`}>
           <Avatar src={profileImage} />
         </Link>
         {/* Comment input field */}
         <Form.Control
           className={styles.Form}
           placeholder="my comment..."
           as="textarea"
           value={content}
           onChange={handleChange}
           rows={2}
         />
       </InputGroup>
     </Form.Group>
     {/* Submit button - disabled if comment is empty */}
     <button
       className={`${styles.Button} btn d-block ml-auto`}
       disabled={!content.trim()}
       type="submit"
     >
       post
     </button>
   </Form>
 );
}

export default CommentCreateForm;
