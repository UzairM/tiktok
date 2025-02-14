Overview
Your project seems to be a TikTok-like application with both frontend and backend components. The frontend is built using React Native with Expo, and the backend is a Node.js service using Express and Firebase. The app includes features for user authentication, video uploading, and video processing.
Frontend
Tech Stack:
React Native with Expo for building the mobile app.
TypeScript for type safety.
React Navigation for handling navigation.
Firebase for authentication and possibly other services.
React Query for data fetching and caching.
Styled Components or similar for UI styling.
Key Features:
Authentication: Uses Firebase for user authentication, with login and signup functionalities.
Video Upload: Users can upload videos, which are then processed and displayed in a feed.
UI Components: Includes custom components like AnimatedButton and Button for user interactions.
State Management: Utilizes React Context and React Query for managing global state and data fetching.
Safe Area Management: Uses react-native-safe-area-context to handle safe areas on devices.
Configuration:
ESLint: Configured to enforce code quality and style.
Babel: Configured with plugins for environment variables and module resolution.
Expo: Configured with various plugins for system UI, screen orientation, and video handling.
Backend
Tech Stack:
Node.js with Express for building the server.
Firebase Admin SDK for interacting with Firebase services.
AWS S3 for video storage.
Fluent-FFmpeg for video processing.
Key Features:
Authentication: Handles user authentication and token verification.
Video Upload and Processing: Users can upload videos, which are processed into HLS format for streaming.
Video Feed: Provides endpoints for fetching video feeds and user-specific videos.
Like System: Allows users to like videos, with likes being stored in Firestore.
Configuration:
Docker: Uses Docker for containerizing the video service.
TypeScript: Configured with strict type checking for better code quality.
Environment Variables: Managed using dotenv for sensitive configurations like AWS credentials.
Summary
The app is a video-sharing platform similar to TikTok, with features for user authentication, video uploading, and processing. The frontend is built with React Native and Expo, while the backend uses Node.js and Firebase. The app is designed to handle video uploads, process them into streamable formats, and display them in a user-friendly feed. The project is well-structured with a focus on modularity, type safety, and performance optimization.