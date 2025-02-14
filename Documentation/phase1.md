# Phase 1: Basic Plant Management & Video Upload

**Goal**: Establish a foundation to store plants and associate any uploaded media with a chosen plant.

## Data Models

  ```typescript
  // Plant model
  export interface Plant {
    id: string
    userId: string
    name: string       // e.g. "Tomato #1"
    type: string       // e.g. "Tomato", "Rose"
    createdAt: number
  }

  // Media model
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

- **Create Plant Collection View**  
  - Build a screen listing all plants for the currently authenticated user.  
  - Provide a button to add a new plant (plant name, type).  
- **Upload Flow Update**  
  - Integrate a "Plant Picker Modal" in the upload form.  
  - Once a user selects or creates a plant, attach the `plantId` to the uploaded media record.

## Backend Tasks

- **FireStore Setup**  
  - Create a `plants` collection with documents containing `name`, `type`, `userId`, and `createdAt`.  
  - Continue using or create a `media` collection; each doc references `plantId`.  
- **Endpoints**  
  - `GET /api/plants`: returns user-specific plants.  
  - `POST /api/plants`: creates a new plant doc.  
  - Integrate `plantId` into your existing upload endpoint for media. 