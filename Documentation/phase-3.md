# Phase 3: Social Features & Core Tech Optimizations

## Following System

### Backend
- [ ] Implement a Firestore collection for user relationships (follows/followers)
- [ ] Enforce rules: only authenticated users can follow/unfollow
- [ ] (Optional) Cloud Function to manage notifications on follow

### Frontend
- [ ] Add follow/unfollow button on profile screens
  - Update Firestore relationship doc
  - Adjust feed to show followed creators' videos
- [ ] Display follower/following counts on profile

## Reporting Content

### Backend
- [ ] Create a Firestore collection for reported content
- [ ] Provide an API endpoint or direct Firestore write for user to submit a report
- [ ] Set up basic moderation console or logs

### Frontend
- [ ] Add a "Report" button in video overlay or menu
- [ ] Show a simple list of report reasons
- [ ] Submit a report to the backend and display a brief confirmation message

## Performance Optimization

### Backend
- [ ] Integrate FFmpeg for optional video compression or thumbnails
- [ ] Explore MediaMTX if live streaming is needed
- [ ] Optimize Firestore queries (limit reads, index creation)
- [ ] Integrate FFmpeg for video compression and thumbnails
- [ ] Configure MinIO bucket lifecycle policies for video storage
- [ ] Set up MediaMTX with MinIO for streaming
- [ ] Optimize Firestore queries (limit reads, index creation)

### Frontend
- [ ] Implement lazy loading of video feed
- [ ] Cache frequently accessed videos
- [ ] Use memoization (e.g., useMemo/useCallback) to reduce re-renders

## Future Features (Post-MVP)
- [ ] Comments
- [ ] Sound/music library
- [ ] Video editing (trimming, filters)
- [ ] Hashtags and trending page
- [ ] Advanced analytics for creators
- [ ] Playlists
- [ ] Refined privacy controls and content discovery

## Testing & Verification
- [ ] Run integration tests to confirm that following, reporting, and feed data are consistent
- [ ] Confirm performance on slow networks and older devices
- [ ] Check all device form factors for UI integrity (tablets, smaller phones, etc.) 