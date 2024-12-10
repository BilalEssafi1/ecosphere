import { createContext, useContext, useEffect, useState } from "react";
import { axiosReq } from "../api/axiosDefaults";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { followHelper, unfollowHelper } from "../utils/utils";

// Create contexts for profile data and setter functions 
const ProfileDataContext = createContext();
const SetProfileDataContext = createContext();

// Custom hooks to access the contexts
export const useProfileData = () => useContext(ProfileDataContext);
export const useSetProfileData = () => useContext(SetProfileDataContext);

export const ProfileDataProvider = ({ children }) => {
 // Initialize profile data state with empty results arrays
 const [profileData, setProfileData] = useState({
   pageProfile: { results: [] },
   popularProfiles: { results: [] },
 });

 const currentUser = useCurrentUser();

 // Handle following a profile
 const handleFollow = async (clickedProfile) => {
   try {
     // Make POST request to create new follower relationship
     const { data } = await axiosReq.post("/followers/", {
       followed: clickedProfile.id,
     });

     // Log successful follow response for debugging
     console.log("Follow response:", data);

     // Update profile data state with new follower relationship
     setProfileData((prevState) => ({
       ...prevState,
       pageProfile: {
         results: prevState.pageProfile.results.map((profile) =>
           followHelper(profile, clickedProfile, data.id)
         ),
       },
       popularProfiles: {
         ...prevState.popularProfiles,
         results: prevState.popularProfiles.results.map((profile) =>
           followHelper(profile, clickedProfile, data.id)
         ),
       },
     }));
   } catch (err) {
     // Enhanced error logging
     console.log("Follow error:", err.response?.data || err);
     if (err.response?.status === 401) {
       console.log("Authentication error - please check your login status");
     }
   }
 };

 // Handle unfollowing a profile
 const handleUnfollow = async (clickedProfile) => {
   try {
     // Make DELETE request to remove follower relationship
     await axiosReq.delete(`/followers/${clickedProfile.following_id}/`);

     // Update profile data state to remove follower relationship
     setProfileData((prevState) => ({
       ...prevState,
       pageProfile: {
         results: prevState.pageProfile.results.map((profile) =>
           unfollowHelper(profile, clickedProfile)
         ),
       },
       popularProfiles: {
         ...prevState.popularProfiles,
         results: prevState.popularProfiles.results.map((profile) =>
           unfollowHelper(profile, clickedProfile)
         ),
       },
     }));
   } catch (err) {
     // Enhanced error logging
     console.log("Unfollow error:", err.response?.data || err);
     if (err.response?.status === 401) {
       console.log("Authentication error - please check your login status");
     }
   }
 };

 // Fetch popular profiles on mount and when currentUser changes
 useEffect(() => {
   const handleMount = async () => {
     try {
       // Get profiles ordered by follower count
       const { data } = await axiosReq.get(
         "/profiles/?ordering=-followers_count"
       );
       // Update popular profiles in state
       setProfileData((prevState) => ({
         ...prevState,
         popularProfiles: data,
       }));
     } catch (err) {
       // Log any errors fetching profiles
       console.log("Profile fetch error:", err.response?.data || err);
     }
   };

   handleMount();
 }, [currentUser]);

 return (
   // Provide profile data and setter functions to children
   <ProfileDataContext.Provider value={profileData}>
     <SetProfileDataContext.Provider
       value={{ setProfileData, handleFollow, handleUnfollow }}
     >
       {children}
     </SetProfileDataContext.Provider>
   </ProfileDataContext.Provider>
 );
};