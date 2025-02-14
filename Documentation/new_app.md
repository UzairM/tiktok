# New App Design with GPT-4o Integration

## 1. Core Features

1. **Video Sharing**  
   - Users upload, view, and interact with short gardening videos/photos.  
   - Retain TikTok-style scrolling feed for content discovery.

2. **Plant Management**  
   - Each user maintains a collection of "Plants" (name, type).  
   - Media uploads are tagged to a specific plant.  
   - Allows quick navigation between each plant's media on the Profile screen.

3. **AI Crop Health (Powered by GPT-4o)**  
   - When a video or image is uploaded, extract relevant frames and send them to GPT-4o.  
   - The model returns insights like pest/disease detection or a "Healthy" status.  
   - This info is stored in Firestore alongside the media record.

4. **Growth Tracking (Powered by GPT-4o)**  
   - GPT-4o extracts approximate growth metrics from frames (e.g., leaf count, plant height if visible).  
   - Stores growth indicators in Firestore for each specific upload.  
   - The UI displays charts/trends per plant over time.

5. **Weather Alerts**  
   - Pull local weather data (e.g., from OpenWeatherMap) for the next 6 days.  
   - GPT-4o forecasts how each plant might be affected by extreme weather.  
   - Visual layout:  
     - Daily forecast cards for 6 days.  
     - For each day, GPT-4o highlights possible plant stress (e.g., "High heat might cause faster evaporation for your tomato plants.").

- **AI Crop Health Prompt**: "You are an AI model designed to analyze plant media for health assessment. Please analyze the attached media and provide the following information: \n1. **Pest/Disease Detection**: Identify any visible signs of pests or diseases.\n2. **Stress Indicators**: Detect any stress indicators such as wilting or discoloration.\n3. **AI Health Score**: Provide an overall health score for the plant.\n4. **Growth Data Extraction**: Extract any growth-related data visible in the media.\nPlease provide the results in a structured format."

- **Growth Tracking Prompt**: "You are an AI model designed to analyze plant images and extract growth metrics. Please analyze the attached image and provide the following information: \n1. **Leaf Count**: Estimate the number of leaves visible in the image.\n2. **Color Changes**: Identify any significant color changes in the leaves or stems.\n3. **Pest/Disease Detection**: Detect any visible signs of pests or diseases.\n4. **Flower/Bud Count**: Count the number of flowers or buds visible in the image.\n5. **AI Health Score**: Provide an overall health score for the plant.\n6. **Growth Rate Estimation**: Compare this image with previous images to estimate the growth rate.\n7. **Stem Diameter and Height Estimation**: Estimate the stem diameter and plant height, if reference objects for scale are present.\nPlease provide the results in a structured format."

- **Weather Alerts Prompt**: "You are an AI model tasked with analyzing weather data and its impact on plants. Please provide a weather forecast and analyze how it will affect the listed plants. Include the following: \n1. **Weather Forecast**: Provide a detailed forecast for the next 6 days.\n2. **Impact Analysis**: Analyze how the forecasted weather conditions will affect each plant.\n3. **Action Suggestions**: Suggest any necessary actions to mitigate adverse effects.\nPlease provide the results in a structured format."

## 2. Data Models (Firestore)

### `media`  
  ```typescript
  export interface MediaItem {
    id: string
    userId: string
    plantId: string
    mediaUrl: string
    uploadedAt: number
    // GPT-4o AI results
    aiResult?: {
      pestDiseases?: string[]  // e.g. ["Aphids", "Powdery Mildew"]
      healthStatus?: string    // e.g. "Healthy" or "Needs Attention"
      growthMetrics?: {
        leafCount?: number
        heightInCm?: number
      }
    }
  }
  ```

### `weatherData`  
  ```typescript
  export interface WeatherData {
    userId: string
    location: { lat: number; lon: number }
    dailyForecasts: Array<{
      date: number
      condition: string
      highTemp: number
      lowTemp: number
      // GPT-4o analysis for each plant:
      gptAnalysis?: Record<string, string> // plantId -> recommended action
    }>
    lastUpdated: number
  }
  ```

> *Note*: If you want separate growth records, you can expand the schema, but the approach above keeps it consolidated in `media.aiResult.growthMetrics`.

## 3. Frontend Architecture

### 3.1 Screens & Components

1. **Home Feed**  
   - Displays short gardening videos in a vertical feed.  
   - Interaction features (like, comment, share) remain.

2. **Upload / AI Scan**  
   - Users upload media.  
   - **Plant Picker Modal** to select or create a new plant.  
   - The backend calls GPT-4o to detect pests/diseases, compute growth metrics, then updates Firestore.

3. **Profile / Plant Management**  
   - Vertical scroll for each plant.  
   - Horizontal carousel for each plant's media.  
   - Growth analytics: displays charts of leaf counts and heights over time, leveraging data from `media.aiResult.growthMetrics`.

4. **Weather & Alerts**  
   - Displays a 6-day forecast (e.g., in a horizontally scrollable forecast bar).  
   - GPT-4o-enhanced advisories for each plant. For example, "Day 3: High heat might dry out your Tomato #1; consider extra watering."  
   - Can be integrated into a new "WeatherScreen" or a dashboard card on the home/Profile screen.

### 3.2 Local State & Data Fetching

- **React Query** handles calls to your custom endpoints:  
  - `GET /api/weather` -> populates local store with forecast data.  
  - `GET /api/plants`, `GET /api/media` -> loads user's plant info and media.  
  - `POST /api/ai/detection` -> triggers GPT-4o processing.

## 4. Backend Endpoints

1. **`POST /api/media`**  
   - Uploads and stores file in S3 or Firebase Storage.  
   - Immediately or asynchronously triggers AI detection with GPT-4o.  
   - Returns a doc ID or job ID for the UI to watch.

2. **`POST /api/ai/detection`**  
   - Accepts `mediaUrl` or raw frames.  
   - Sends it to GPT-4o for pest/disease check and basic growth metrics.  
   - Updates corresponding `media` doc in Firestore with `aiResult`.

3. **`GET /api/plants`, `POST /api/plants`**  
   - Lists and creates plants for the current user.

4. **`GET /api/weather`**  
   - Retrieves the next 6 days of weather data.  
   - Invokes GPT-4o for each plant in user's inventory to get tailored advice (populates `gptAnalysis`).  
   - Persists it in `weatherData`, then returns JSON to the client.

## 5. Workflow Details

1. **Upload**  
   - User chooses a plant or creates a new one.  
   - Upload media -> store doc -> call GPT-4o.  
   - GPT-4o returns `pestDiseases`, `healthStatus`, `growthMetrics`.  
   - Firestore updated: `media.aiResult = { ... }`.

2. **Profile Page**  
   - Displays each plant's media horizontally.  
   - Tapping an item shows detailed AI info (which pests, recommended actions, growth metrics).  
   - Optional: Over time, present growth graphs using the `growthMetrics` from each upload.

3. **Weather Screen**  
   - Shows daily forecast for the next 6 days.  
   - GPT-4o uses forecast + user's plant data to produce a short text for each plant/day pair.  
   - UI might have a day-card layout, each day has a small list of plants with short GPT-4o warnings or tips.

## 6. Example Code Snippets

### AI Integration Example (Backend)

  ```typescript
  import axios from 'axios'
  import { MediaItem } from '../types/media'

  export async function runGptAiAnalysis(mediaUrl: string): Promise<MediaItem['aiResult']> {
    // Assume there's a GPT-4o microservice or API
    const response = await axios.post('GPT4O_ENDPOINT', { mediaUrl })
    return response.data // { pestDiseases, healthStatus, growthMetrics: { leafCount, heightInCm }, ... }
  }
  ```

### Weather GPT-4o Example (Backend)

  ```typescript
  import axios from 'axios'
  import { WeatherData } from '../types/weather'
  import { getUserPlants } from './plant-controller'
  import { runGptWeatherAnalysis } from './gpt-weather-analysis'

  export async function getExtendedForecast(userId: string): Promise<WeatherData> {
    // fetch lat/long from user profile
    // call external weather API for 6-day forecast
    const forecast = await axios.get('https://api.openweathermap.org/...')

    const plants = await getUserPlants(userId)

    // For each day, for each plant, run GPT to get advice
    const gptAnalysis = await runGptWeatherAnalysis(forecast.data, plants)

    // store in weatherData collection in Firestore
    // return to client
  }
  ```

### Growth Chart Example (Frontend)

  ```typescript
  import React from 'react'
  import { View, Text } from 'react-native'
  import { MediaItem } from '../types/media'
  // Some chart library import...

  interface GrowthChartProps {
    mediaItems: MediaItem[]
  }

  export function GrowthChart({ mediaItems }: GrowthChartProps) {
    // filter out media that has growthMetrics
    const data = mediaItems
      .filter((m) => m.aiResult?.growthMetrics)
      .map((m) => ({
        x: new Date(m.uploadedAt),
        height: m.aiResult?.growthMetrics?.heightInCm || 0,
        leaves: m.aiResult?.growthMetrics?.leafCount || 0,
      }))

    if (!data.length) return <Text>No growth data yet</Text>

    return (
      <View>
        {/* Replace with a real chart library, e.g. VictoryCharts or Reanimated */}
        <Text>Growth Over Time (In cm / Leaf Count)</Text>
        {/* Render the data... */}
      </View>
    )
  }
  ```

## 7. Final Notes

- **Scalability**: GPT-4o calls might be expensive; consider a queue mechanism or async processing to handle bursts of uploads.  
- **User Experience**: Provide user-friendly explanations of AI results ("We found possible aphids on your rose. Try using a mild insecticidal soap.").  
- **Performance**: Caching or partial hydration from local storage can reduce overhead on repeated weather or AI calls.  
- **Security**: Validate user submissions. Secure your AI endpoints and weather data to prevent misuse.

With this plan, you retain the core TikTok-like video-sharing experience, while layering in a comprehensive gardening AI system powered by GPT-4o for pest/disease detection, growth tracking, and weather-based advisories.

---

**Sources**  
- [Expo Docs](https://docs.expo.dev/)  
- [Firebase Docs](https://firebase.google.com/docs)  
- [React Query](https://tanstack.com/query/latest)  
- [OpenWeatherMap](https://openweathermap.org/)  
- [TensorFlow.js](https://www.tensorflow.org/js) 