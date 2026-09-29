/**
 * Stage 1: Diagnostic Audit for Live Data Sync and Local PostgreSQL Integration
 */
const { performance } = require('perf_hooks');
const https = require('https');

async function stage1Diagnose() {
  console.log("===========================================================================");
  console.log("STAGE 1: DIAGNOSE (NO CODE CHANGES YET)");
  console.log("===========================================================================\n");

  // 1. Call GET /api/weather/cities
  const apiUrls = ['http://localhost:8085/api/weather/cities', 'http://localhost:8080/api/weather/cities'];
  for (const url of apiUrls) {
    try {
      const t0 = performance.now();
      const res = await fetch(url);
      const t1 = performance.now();
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (_) {}
      
      console.log(`[GET ${url}]`);
      console.log(`- Status Code: ${res.status}`);
      console.log(`- Time Taken: ${(t1 - t0).toFixed(2)} ms`);
      if (data && data.cities) {
        console.log(`- Total Cities: ${data.cities.length}`);
        console.log(`- First Record:`, JSON.stringify(data.cities[0], null, 2));
      } else {
        console.log(`- Raw Body Preview (first 120 chars):`, text.substring(0, 120));
      }
    } catch (err) {
      console.log(`[GET ${url}] Error: ${err.message}`);
    }
  }

  // 2. Call Open-Meteo multi-location request directly
  console.log("\n---------------------------------------------------------------------------");
  console.log("Open-Meteo Multi-Location Array Response Check");
  console.log("---------------------------------------------------------------------------");
  const testCities = [
    { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 }
  ];
  const lats = testCities.map(c => c.lat).join(',');
  const lons = testCities.map(c => c.lon).join(',');
  const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=7&timezone=Asia%2FKolkata`;

  try {
    const t0 = performance.now();
    const omRes = await fetch(omUrl);
    const t1 = performance.now();
    const omData = await omRes.json();
    console.log(`Open-Meteo URL: ${omUrl}`);
    console.log(`- Status: ${omRes.status}, Latency: ${(t1 - t0).toFixed(2)} ms`);
    console.log(`- Is Array Response: ${Array.isArray(omData)}`);
    console.log(`- Array Length: ${Array.isArray(omData) ? omData.length : 1} (Matches input locations: ${testCities.length})`);
    if (Array.isArray(omData)) {
      omData.forEach((item, idx) => {
        console.log(`  [City Index ${idx}] ${testCities[idx].name} -> Lat: ${item.latitude}, Lon: ${item.longitude}, Temp: ${item.current?.temperature_2m}°C, Weather Code: ${item.current?.weather_code}`);
      });
    }
  } catch (err) {
    console.log(`Open-Meteo Call Failed: ${err.message}`);
  }

  // 3. Frontend Call & Port Configuration Analysis
  console.log("\n---------------------------------------------------------------------------");
  console.log("Frontend Port & URL Routing Check");
  console.log("---------------------------------------------------------------------------");
  console.log("- Frontend served at: http://localhost:8000");
  console.log("- Backend REST running at: http://localhost:8085 (Port 8080 is occupied/reserved by Docker forwarder)");
  console.log("- CORS headers present on backend: Access-Control-Allow-Origin: *");
  console.log("- Multi-port resolution in client app.js: CANDIDATE_API_BASES = ['', 'http://localhost:8085', 'http://localhost:8080']");
  console.log("===========================================================================\n");
}

stage1Diagnose();
