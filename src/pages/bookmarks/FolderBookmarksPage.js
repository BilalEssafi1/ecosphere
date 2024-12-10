import React, { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import Asset from "../../components/Asset"; // Ensure Asset is correctly imported
import { useParams } from "react-router-dom";
import styles from "../../styles/FolderBookmarksPage.module.css";
import Post from "../posts/Post"; // Import the Post component

const FolderBookmarksPage = () => {
  const { folder_id } = useParams(); // Use the folder_id from the URL params
  const [bookmarks, setBookmarks] = useState([]); // Initialize as an empty array
  const [hasLoaded, setHasLoaded] = useState(false); // Loading state

  /**
   * Fetch bookmarks for the specified folder.
   */
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const { data } = await axiosReq.get(`/folders/${folder_id}/bookmarks/`);
        setBookmarks(data.results); // Set the fetched bookmark data
        setHasLoaded(true); // Mark data as loaded
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setHasLoaded(true);  // Set hasLoaded to true even in case of an error
      }
    };

    fetchBookmarks();
  }, [folder_id]); // Re-run when folder_id changes

  return (
    <div className={styles.FolderBookmarksPage}>
      <h1>Folder Bookmarks</h1>

      {hasLoaded ? ( // Once data is loaded, show bookmarks or an empty message
        bookmarks.length ? ( // Check if bookmarks exist
          bookmarks.map((bookmark) => (
            <div key={bookmark.id} className={styles.BookmarkItem}>
              {/* Pass the bookmark data to the Post component */}
              <Post
                id={bookmark.id}
                owner={bookmark.owner}
                profile_id={bookmark.profile_id}
                profile_image={bookmark.profile_image}
                comments_count={bookmark.comments_count}
                likes_count={bookmark.likes_count}
                like_id={bookmark.like_id}
                title={bookmark.post_title}
                content={bookmark.post_content}
                image={bookmark.post_image}
                updated_at={bookmark.updated_at}
                tags={bookmark.post_tags} // Assuming the tags are stored like this
                postPage={false} // If you want to display the post without edit/delete options
              />
            </div>
          ))
        ) : ( // If no bookmarks are present
          <p>No bookmarks in this folder yet.</p>
        )
      ) : ( // If data hasn't loaded yet, show spinner
        <Asset spinner /> // Show loading spinner while data is loading
      )}
    </div>
  );
};

export default FolderBookmarksPage;
