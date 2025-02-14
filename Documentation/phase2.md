# Phase 2: AI Integration with GPT-4o (Crop Health)

**Goal**: Process each video/image upload and run a GPT-4o model to detect plant health, pests, and diseases.

## Data Models

  ```typescript
  // Media model (repeat for clarity, focusing on the aiResult)
  export interface MediaItem {
    id: string
    userId: string
    plantId: string
    mediaUrl: string
    uploadedAt: number
    aiResult?: {
      pestDiseases?: string[]   // e.g. ["Aphids", "Powdery Mildew"]
      healthStatus?: string     // e.g. "Healthy" or "Needs Attention"
      growthMetrics?: {
        leafCount?: number
        heightInCm?: number
      }
    }
  }
  ```

## Frontend Tasks

- **Upload / AI Scan Step**  
  - After uploading the media, trigger a request to an AI detection endpoint (`/api/ai/detection`).  
  - Display results from GPT-4o (e.g., "Healthy," "Aphids detected," etc.) within the UI.

## Backend Tasks

- **Frame Extraction & AI Requests**  
  - Integrate your AI flow (extract frames via FFmpeg or store images).  
  - Post frames or a reference `mediaUrl` to GPT-4o.  
  - Parse the AI response and store the data in `media.aiResult`.
- **Endpoints**  
  - `POST /api/ai/detection`: receives `mediaUrl` or frames.  
  - Calls GPT-4o to return pests, health status, etc.  
  - Updates Firestore's `media` doc with an `aiResult` object. 