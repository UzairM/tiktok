# Phase 1: Project Setup and Basic User Accounts

## Environment Setup

### Backend
- [x] Initialize Node.js project
- [x] Install required packages (Express, Firebase Admin SDK, MinIO SDK, etc.)
- [x] Configure Firebase project (service account for admin, environment variables)
- [x] Configure MinIO (service accounts, environment variables)

### Frontend
- [x] Create new React Native (Expo) project
- [x] Configure API client for backend communication
- [x] Set up environment variables for API URL

## User Authentication & Profile

### Backend
- [x] Implement sign-up API using Firebase Admin SDK
  - Create user with minimal profile data
  - Secure with token-based or session-based auth
- [x] Implement login API
- [x] Setup basic security rules for Firestore (or Realtime DB) for user docs

### Frontend
- [x] Add email-based signup flow
  - Collect username, email, password
  - Validate input
  - Send payload to backend
- [x] Add login/logout flow
- [x] Display basic user profile screen
  - Show username, profile image (optional placeholder)
- [x] Implement public/private account toggle (UI only, toggle not yet enforced in backend)

## Testing & Verification
- [x] Unit test backend sign-up and login endpoints
- [x] Test React Native Firebase sign-up and login on real or emulated devices
- [x] Confirm user data is stored securely in Firebase 