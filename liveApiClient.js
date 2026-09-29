/**
 * WeatherPulse India — Real Live API Client
 * Clean client routing through backend APIs with Open-Meteo free fallback.
 * Zero API keys exposed in frontend code.
 */

class LiveApiClient {
  /**
   * Fetches live satellite/sensor weather for coordinates via Open-Meteo
   */
  static async fetchCityWeather(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current = data.current || {};
        console.log(`[Open-Meteo] Live response for (${lat}, ${lon}):`, current);
        return {
          temp_c: current.temperature_2m || 28.0,
          humidity_pct: current.relative_humidity_2m || 80,
          rain_mm: current.precipitation || 0.0,
          wind_kmph: current.wind_speed_10m || 15.0,
          wmo_code: current.weather_code || 0,
          provider: "Open-Meteo Global Sensor Network"
        };
      }
    } catch (err) {
      console.warn("[Open-Meteo] Fetch fallback:", err);
    }
    return null;
  }

  /**
   * Fetches official Open Government Data (data.gov.in) via secure backend proxy
   * (Corresponding to Invoke-RestMethod https://api.data.gov.in/resource/...)
   */
  static async fetchDataGovIn(resourceId = "9ef84268-d588-465a-a308-a864a43d0070", limit = 5) {
    try {
      const url = `/api/gov/data-gov-in?resource_id=${encodeURIComponent(resourceId)}&limit=${limit}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (err) {
      console.warn("[LiveApiClient] data.gov.in proxy fallback:", err);
    }
    return null;
  }
}

window.LiveApiClient = LiveApiClient;
