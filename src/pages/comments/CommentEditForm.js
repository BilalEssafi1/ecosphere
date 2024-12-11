import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { axiosRes } from "../../api/axiosDefaults";
import styles from "../../styles/CommentCreateEditForm.module.css";

/**
* Handles editing of existing comments
* Includes form validation and submission handling
*/
function CommentEditForm(props) {
 // Destructure props needed for comment editing
 const { id, content, setShowEditForm, setComments } = props;

 // State to manage edited comment content
 const [formContent, setFormContent] = useState(content);

 /**
  * Handles changes to comment edit field
  */
 const handleChange = (event) => {
   setFormContent(event.target.value);
 };

 /**
  * Handles form submission for updating comment
  */
 const handleSubmit = async (event) => {
   event.preventDefault();
   try {
     // Update comment via API
     await axiosRes.put(`/comments/${id}/`, {
       content: formContent.trim(),
     });

     // Update comments state with edited comment
     setComments((prevComments) => ({
       ...prevComments,
       results: prevComments.results.map((comment) => {
         return comment.id === id
           ? {
               ...comment,
               content: formContent.trim(),
               updated_at: "now",
             }
           : comment;
       }),
     }));
     // Hide edit form after successful update
     setShowEditForm(false);
   } catch (err) {
   }
 };

 return (
   <Form onSubmit={handleSubmit}>
     <Form.Group className="pr-1">
       {/* Comment edit input field */}
       <Form.Control
         className={styles.Form}
         as="textarea"
         value={formContent}
         onChange={handleChange}
         rows={2}
       />
     </Form.Group>
     <div className="text-right">
       {/* Cancel editing button */}
       <button
         className={styles.Button}
         onClick={() => setShowEditForm(false)}
         type="button"
       >
         cancel
       </button>
       {/* Save button - disabled if content is empty */}
       <button
         className={styles.Button}
         disabled={!content.trim()}
         type="submit"
       >
         save
       </button>
     </div>
   </Form>
 );
}

export default CommentEditForm;
