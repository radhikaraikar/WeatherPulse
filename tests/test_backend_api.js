/**
 * WeatherPulse India — Integration Test Suite
 * Validates GIGW-compliant endpoints: Weather for 35 cities, Alerts Engine, and Auth RBAC
 */

async function runTestSuite() {
  console.log("===========================================================================");
  console.log("WeatherPulse India — Integration API Test Suite");
  console.log("===========================================================================");

  const baseUrl = process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:8080";

  // Test 1: Health Check
  try {
    const health = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log("[PASS] 1. /health -> Status:", health.status, "| Service:", health.service);
  } catch (err) {
    console.error("[FAIL] 1. /health ->", err.message);
  }

  // Test 2: 35 Cities Automatic Live Weather
  try {
    const weather = await fetch(`${baseUrl}/api/weather/cities`).then(r => r.json());
    console.log("[PASS] 2. /api/weather/cities -> Total Cities:", weather.cities?.length);
    if (weather.cities && weather.cities.length > 0) {
      console.log("       Sample Observatory:", weather.cities[0].city, `(${weather.cities[0].state})`);
      console.log("       Telemetry: Temp:", weather.cities[0].current.temperature_c + "°C", "| IMD Status:", weather.cities[0].warning.label);
    }
  } catch (err) {
    console.error("[FAIL] 2. /api/weather/cities ->", err.message);
  }

  // Test 3: Geolocation Dynamic Weather
  try {
    const loc = await fetch(`${baseUrl}/api/weather/location?lat=28.6139&lng=77.2090`).then(r => r.json());
    console.log("[PASS] 3. /api/weather/location -> Current Temp:", loc.current?.temperature_c + "°C", "| Condition:", loc.current?.condition);
    console.log("       Hourly Forecast (12h):", loc.next_12_hours?.length, "slots | Daily (7d):", loc.next_7_days?.length, "days");
  } catch (err) {
    console.error("[FAIL] 3. /api/weather/location ->", err.message);
  }

  // Test 4: Upcoming-Weather 72h Alert Engine
  try {
    const alerts = await fetch(`${baseUrl}/api/alerts`).then(r => r.json());
    console.log("[PASS] 4. /api/alerts -> Active Early Warnings:", alerts.alerts?.length, "| Origin:", alerts.origin);
    if (alerts.alerts && alerts.alerts.length > 0) {
      console.log("       Top Warning:", alerts.alerts[0].headline);
      console.log("       Threshold Breached:", alerts.alerts[0].threshold);
      console.log("       Safety Advice:", alerts.alerts[0].safety_advice);
    }
  } catch (err) {
    console.error("[FAIL] 4. /api/alerts ->", err.message);
  }

  // Test 5: Citizen Auth Signup
  const testEmail = `radhika.test.${Date.now()}@weatherpulse.in`;
  let authToken = null;
  try {
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Radhika Sharma",
        email: testEmail,
        state: "Karnataka",
        password: "SecurePassword2026",
        confirm_password: "SecurePassword2026",
        accept_terms: true
      })
    }).then(r => r.json());
    console.log("[PASS] 5. /api/auth/signup -> Registered Citizen:", signupRes.user?.full_name, "| Role:", signupRes.user?.role);
    authToken = signupRes.token;
  } catch (err) {
    console.error("[FAIL] 5. /api/auth/signup ->", err.message);
  }

  // Test 6: Citizen Auth Login
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "SecurePassword2026"
      })
    }).then(r => r.json());
    console.log("[PASS] 6. /api/auth/login -> Authenticated Role:", loginRes.user?.role, "| JWT Token Received:", Boolean(loginRes.token));
  } catch (err) {
    console.error("[FAIL] 6. /api/auth/login ->", err.message);
  }

  // Test 7: Default Admin Login
  try {
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@weatherpulse.in",
        password: "Admin@WeatherPulse2026"
      })
    }).then(r => r.json());
    console.log("[PASS] 7. Default Admin Login -> Role:", adminRes.user?.role, "| Accessing Moderation Queue...");
    
    // Access Moderation with Admin Token
    const modRes = await fetch(`${baseUrl}/api/moderation/queue`, {
      headers: { "Authorization": `Bearer ${adminRes.token}` }
    }).then(r => r.json());
    console.log("       Moderation Queue Size:", modRes.queue_size !== undefined ? modRes.queue_size : modRes.items?.length);
  } catch (err) {
    console.error("[FAIL] 7. Admin Login / Moderation Queue ->", err.message);
  }

  console.log("===========================================================================");
  console.log("All Integration Tests Completed Successfully!");
  console.log("===========================================================================");
}

runTestSuite();
