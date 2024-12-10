# Welcome to Ecosphere

[View the live project here](https://ecosphere-social-8d56a42d0db7.herokuapp.com/)

Ecosphere is a social media platform designed to connect users who are passionate about sustainability and eco-friendly living. The platform allows users to share posts, follow other users, like and comment on posts, and engage in a community focused on environmental awareness. This project was developed as part of the Code Institute's fourth Project Portfolio.

# Table of Contents
1. [UX](#ux)
2. [Agile Development](#agile-development)
3. [Features Implemented](#features-implemented)
4. [Technology Used](#technology-used)
5. [Testing](#testing)
6. [Bugs](#bugs)
7. [Deployment](#deployment)
8. [Credits and Acknowledgements](#credits-and-acknowledgement)

# UX

## Goals and Target Audience
Ecosphere is designed for individuals who are passionate about sustainability and eco-friendly living. The website provides essential features for easy navigation, user engagement, and community building, suitable for individuals, families, and groups looking to connect and share their experiences and knowledge about environmental awareness.

## Design 
The Ecosphere website embraces a color palette inspired by nature, with earthy and inviting tones that reflect the theme of sustainability:

Green and Earthy Tones: Rich shades of green and earthy tones are used as primary colors, evoking the natural warmth and sophistication associated with environmental awareness.
Accents of Blue and White: These accents are used sparingly to highlight call-to-action buttons, enhancing user navigation while fitting the theme of sustainability and clarity.
Light and Airy Backgrounds: These tones provide a clean and welcoming background that contrasts beautifully with the deeper colors, ensuring readability and a visually pleasing experience.

This color scheme not only aligns with the theme of sustainability but also helps create an inviting, elegant atmosphere for users exploring the platform’s offerings and engaging with the community.

## Database planning

## Final data structure
![Screenshot database structure](src/assets/api-database.png)
After refining the project and finalizing essential features, I created the database schema to accommodate specific requirements for user management, post creation, and community engagement. Using Creately, I visually outlined the final data structure, focusing on the User, Post, Comment, Like, and Profile tables, and their relationships.

## Wireframes

### Large and medium screens
![Screenshot wireframe homepage large screen](src/assets/homepage.png)

![Screenshot wireframe sign up page large screen](src/assets/signup.png)

![Screenshot wireframe sign in page large screen](src/assets/signin.png)

![Screenshot wireframe add post page large screen](src/assets/add-post.png)

![Screenshot wireframe profile page large screen](src/assets/user-profile.png)


### Small screens

![Screenshot wireframe small screen](src/assets/homepage-mobile.png)

![Screenshot wireframe sign up page small screen](src/assets/signup-mobile.png)

![Screenshot wireframe sign in page small screen](src/assets/sign-in-mobile.png)

![Screenshot wireframe add post page small screen](src/assets/add-post-mobile.png)

![Screenshot wireframe profile page small screen](src/assets/user-profile-mobile.png)


# Agile Development
## Overview
This project followed Agile methodology with iterative development cycles, feature prioritization, and task tracking. Development tasks were organized and tracked with GitHub Projects, which ensured the timely delivery of essential functionalities. Each sprint was dedicated to the development and refinement of specific feature sets, including the homepage design, post creation, user profiles, and community engagement.

I initiated this project with a clear intent to streamline workflow and effectively manage the expected workload. After outlining the major epics, I systematically decomposed them into actionable user stories and smaller tasks. This approach not only enhanced my ability to monitor progress but also served as a motivational framework to complete the project on schedule. In addition to the user stories, I created distinct issues for each module of the README.md file, further clarifying objectives and ensuring all components were addressed.

For a comprehensive overview of the project's progress and workflow, please refer to this Kanban page

## User Stories


### List of User Stories
1. [User Story: Home Page](https://github.com/BilalEssafi1/dar-tangier-project/issues/15)
2. [User Story: Admin Panel](https://github.com/BilalEssafi1/dar-tangier-project/issues/22)
3. [User Story: Sign-Up for Account](https://github.com/BilalEssafi1/dar-tangier-project/issues/16)
4. [User Story: Sign-In to Account](https://github.com/BilalEssafi1/dar-tangier-project/issues/17)
5. [User Story: Manage Reservations](https://github.com/BilalEssafi1/dar-tangier-project/issues/18)
6. [User Story: Delete Account](https://github.com/BilalEssafi1/dar-tangier-project/issues/19)
7. [User Story: Forgot Password](https://github.com/BilalEssafi1/dar-tangier-project/issues/20)
8. [User Story: Manage User Information](https://github.com/BilalEssafi1/dar-tangier-project/issues/21)


# Features Implemented




# Testing

## Validator Testing

- HTML
    - No errors were returned when passing through the official W3C validator.
![Screenshot html testing](static/assets/images/readme/html-validation.png)

- CSS
    - No errors were returned when passing through the official Jigsaw validator.
![Screenshot html testing](static/assets/images/readme/css-validation.png)

- JavaScript
    - No significant issues were returned when passing the code through Jshint.
![Screenshot javascript testing](static/assets/images/readme/jshint-validation.png)

- PEP8 Validation: The code was validated using PEP8 style guide without any errors.
![Screenshot javascript testing](static/assets/images/readme/pep8-validation.png)

- Accessibility
    - I confirmed that the colors and fonts chosen are easy to read and accessible by running it through lighthouse in devtools.
![Screenshot accessibility testing](static/assets/images/readme/accessibility.png)

## Manual testing


# Bugs

## Solved Bugs
- The image upload functionality was storing files locally instead of uploading them to Cloudinary because of incomplete storage configuration. Images were being saved with local URLs (e.g., "http://8000-bilalessafi1-drfapi-3ety8hg1ccw.ws.codeinstitute-ide.net/media/posts/") rather than being uploaded to Cloudinary's cloud storage. To resolve this, I added explicit MediaCloudinaryStorage to the Post model's image field and verified proper initialization of Cloudinary settings. The solution ensures images are now properly uploaded to Cloudinary and served via their CDN URLs.

- The dropdown menu and profile image were being hidden behind other elements on the page due to positioning and z-index and overflow issues. The dropdown and image components were not being properly layered above other content, causing them to be clipped or not displayed. To resolve this, I applied the following fixes:
I ensured the parent container of the dropdown and profile image had position: relative; to establish a positioning context.
I adjusted the z-index values of the dropdown and profile image to ensure they appear above other elements, particularly the background and parent containers.
I set overflow: visible; on the parent containers to prevent clipping of child elements.
These changes ensure that dropdown menus, profile images, and other modals are correctly displayed above the background and other elements, improving visibility and user interaction.

- The default avatar image for new users was not showing correctly, and instead, an incorrect image URL was being generated. This occurred because the MEDIA_URL and MEDIA_ROOT settings, which are used for local file storage, were conflicting with Cloudinary’s storage system.
To fix this:
I removed the MEDIA_URL and MEDIA_ROOT settings from settings.py to avoid any conflict with Cloudinary.
I ensured that the DEFAULT_FILE_STORAGE setting was configured to use cloudinary_storage.storage.MediaCloudinaryStorage, which properly handles Cloudinary image URLs.
This resolved the issue, and now new users see the correct default avatar image from Cloudinary.

- The login functionality failed due to CSRF token and authentication issues across different browsers. The solution involved updating several components: adding proper token refresh logic in useRedirect.js, implementing CSRF handling in SignInForm, and updating axiosDefaults.js with improved request interceptors. We also added proper error logging and token storage management. Browser caching caused persistent issues in previously used browsers, which were resolved by clearing cached data, cookies, and local storage. The solution ensures consistent authentication behavior across all browsers and sessions.
The PostsPage component failed to display posts after login due to redundant token validation causing authentication errors. The issue stemmed from explicit token checking in the component while the axiosReq instance was already handling authentication through interceptors. The solution involved simplifying the PostsPage component by removing manual token validation and relying on the existing axios interceptors for authentication. We also added the currentUser to the dependency array to ensure the component responds to authentication state changes. These changes allowed the component to properly utilize the authentication system already in place, resolving the "No valid authentication token" error and successfully displaying posts after login.


# Deployment

## Steps for Deploying a Django Application on Heroku
1
## Forking and Cloning a GitHub Repository

# Credits and Acknowledgement
