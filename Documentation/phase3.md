# Phase 3: Growth Tracking

**Goal**: Use the GPT-4o data to analyze growth metrics—e.g., leaf count, stem height—from each upload.

## Data Models

  ```typescript
  // media.aiResult.growthMetrics is used for growth data
  export interface MediaItem {
    id: string
    userId: string
    plantId: string
    mediaUrl: string
    uploadedAt: number
    aiResult?: {
      pestDiseases?: string[]
      healthStatus?: string
      growthMetrics?: {
        leafCount?: number
        heightInCm?: number
      }
    }
  }
  ```

## Frontend Tasks

- **Growth Chart Component**  
  - Filter the user's media for a specific plant.  
  - Plot `aiResult.growthMetrics` (`heightInCm`, `leafCount`) across timestamps.  
  - Provide a visual timeline or chart within the Profile screen.

## Backend Tasks

- **Store Growth Metrics**  
  - Ensure `aiResult.growthMetrics` is saved in each `media` doc.  
  - Optionally create a `growthRecords` collection if you prefer a separate schema.  
- **Refine AI Endpoint**  
  - Request GPT-4o to extract growth data each time new media is uploaded.  
  - Save structured results (leaf count, height, etc.) to Firestore. 