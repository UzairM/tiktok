# Phase 2: Core Video Feed and Upload

## Video Feed

### Backend
- [ ] Create Firestore collection for storing video metadata (title, URL, userId, timestamp)
- [ ] Expose API or direct Firestore queries for retrieving video feed (e.g., ordered by latest)
- [ ] Secure read rules in Firestore so only public videos are accessible

### Frontend
- [ ] Build home screen with a vertical feed of videos
  - Autoplay videos when in view
  - Loop videos
  - Implement a loading indicator
- [ ] Retrieve video metadata from Firestore
  - Render in a FlatList or similar
  - Display video thumbnail or auto-play the first few seconds

## Video Upload

### Backend
- [ ] Expose a Firebase Storage bucket for uploads
- [ ] Configure MinIO bucket for video uploads
- [ ] Implement file size and type restrictions in upload middleware
- [ ] Store video metadata in Firestore and MinIO references:
  - userId reference
  - video URL (after successful upload)
  - timestamp

### Frontend
- [ ] Create an upload screen
  - Select video from device's camera roll
  - Display progress bar during upload
  - Save metadata to Firestore
- [ ] Show uploaded videos in user's profile feed

## Like Feature (Basic Engagement)

### Backend
- [ ] Create a Firestore sub-collection or field for likes on each video document
- [ ] (Optional) Cloud Function to increment a like count for analytics or manage concurrency

### Frontend
- [ ] Implement a like button overlay on each video
  - Single tap to like/unlike
  - Update Firestore in real-time (or after a short debounce)
- [ ] Display like count on the video overlay

## Testing & Verification
- [ ] Test video upload on real devices (Android/iOS)
- [ ] Confirm upload speed, ensure basic compression (optional if large videos are allowed)
- [ ] Verify like count increments properly in Firestore
- [ ] Ensure feed scrolls smoothly with auto-playing videos 