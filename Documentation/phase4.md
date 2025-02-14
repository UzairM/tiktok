# Phase 4: Weather Alerts

**Goal**: Fetch local weather data, generate GPT-4o-based insights, and display shifting forecasts for the next 6 days.

## Data Models

  ```typescript
  export interface WeatherData {
    userId: string
    location: { lat: number; lon: number }
    dailyForecasts: Array<{
      date: number
      condition: string
      highTemp: number
      lowTemp: number
      gptAnalysis?: Record<string, string> // plantId -> recommended action
    }>
    lastUpdated: number
  }
  ```

## Frontend Tasks

- **Weather Screen**  
  - Show 6-day forecast in horizontally scrollable components or day-cards.  
  - For each plant, highlight GPT-4o advice (e.g., "High heat could stress Tomato #1").  
- **Notifications (Optional)**  
  - Use push notifications or in-app alerts for severe weather conditions.

## Backend Tasks

- **Weather Data Fetch**  
  - Use OpenWeatherMap or similar service to retrieve forecast data.  
  - Store in `weatherData` doc keyed by user/location.  
- **GPT-4o Weather Analysis**  
  - For each plant in the user's inventory, run a prompt that includes the upcoming weather data.  
  - Write GPT-4o's day-by-day tips to `weatherData.dailyForecasts[gptAnalysis]`.

---

**Implementation Order**  
1. **Phase 1**: Basic plant management & video upload.  
2. **Phase 2**: GPT-4o crop health detection.  
3. **Phase 3**: Growth metrics & charts.  
4. **Phase 4**: Weather alerts & GPT-4o advisories. 