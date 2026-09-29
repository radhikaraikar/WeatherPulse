const { performance } = require('perf_hooks');

async function diagnoseStage1() {
  console.log("===========================================================================");
  console.log("STAGE 1: DIAGNOSE AND REPORT AUDIT");
  console.log("===========================================================================\n");

  // 1. Check services and health endpoints
  const healthEndpoints = ['http://localhost:8085/health', 'http://localhost:8080/health'];
  for (const ep of healthEndpoints) {
    try {
      const t0 = performance.now();
      const res = await fetch(ep);
      const t1 = performance.now();
      const body = await res.json();
      console.log(`[Health] ${ep} -> Status: ${res.status} (${(t1 - t0).toFixed(1)}ms):`, body);
    } catch (e) {
      console.log(`[Health] ${ep} -> Unreachable: ${e.message}`);
    }
  }

  // 2. Call GET /api/weather/cities
  const weatherEndpoints = ['http://localhost:8085/api/weather/cities', 'http://localhost:8080/api/weather/cities'];
  for (const ep of weatherEndpoints) {
    try {
      const t0 = performance.now();
      const res = await fetch(ep);
      const t1 = performance.now();
      const data = await res.json();
      console.log(`\n[Cities API] ${ep} -> Status: ${res.status}, Response Time: ${(t1 - t0).toFixed(1)}ms, Cities Loaded: ${data.cities?.length}`);
      if (data.cities && data.cities.length > 0) {
        console.log("First Record Sample:", JSON.stringify(data.cities[0], null, 2));
      }
    } catch (e) {
      console.log(`\n[Cities API] ${ep} -> Failed: ${e.message}`);
    }
  }

  // 3. Call Open-Meteo directly from backend to check raw response shape for multi-location
  console.log("\n[Open-Meteo Direct Telemetry Audit]");
  try {
    const lats = '28.6139,19.0760';
    const lons = '77.2090,72.8777';
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=7&timezone=Asia%2FKolkata`;
    console.log("URL:", openMeteoUrl);
    const t0 = performance.now();
    const omRes = await fetch(openMeteoUrl);
    const t1 = performance.now();
    const omData = await omRes.json();
    console.log(`Open-Meteo Response -> Status: ${omRes.status}, Latency: ${(t1 - t0).toFixed(1)}ms`);
    console.log("Raw Response Structure is Array?:", Array.isArray(omData), "| Array Elements Count:", Array.isArray(omData) ? omData.length : 1);
    if (Array.isArray(omData)) {
      console.log("Location 1 (Delhi): Lat:", omData[0].latitude, "Lon:", omData[0].longitude, "Temp:", omData[0].current?.temperature_2m, "°C");
      console.log("Location 2 (Mumbai): Lat:", omData[1].latitude, "Lon:", omData[1].longitude, "Temp:", omData[1].current?.temperature_2m, "°C");
      console.log("Hourly Keys Present:", Object.keys(omData[0].hourly || {}));
      console.log("Daily Keys Present:", Object.keys(omData[0].daily || {}));
    }
  } catch (e) {
    console.log("Open-Meteo Direct Error:", e.message);
  }

  // 4. Test Sign-up endpoint with test payload
  console.log("\n[Authentication Sign-up Endpoint Audit]");
  try {
    const signupUrl = 'http://localhost:8085/api/auth/signup';
    const testEmail = `stage1.diagnose.${Date.now()}@weatherpulse.in`;
    const signupPayload = {
      full_name: 'Stage1 Auditor',
      email: testEmail,
      state: 'Karnataka',
      password: 'AuditPassword2026',
      confirm_password: 'AuditPassword2026'
    };
    console.log("Payload:", signupPayload.email);
    const res = await fetch(signupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupPayload)
    });
    const resBody = await res.json();
    console.log(`POST /api/auth/signup -> Status: ${res.status}:`, resBody);
  } catch (e) {
    console.log("Sign-up Endpoint Error:", e.message);
  }

  console.log("\n===========================================================================");
}

diagnoseStage1();
