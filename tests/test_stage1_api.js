/**
 * Stage 1 Public Weather API Automated Verification Test
 */

const http = require('http');

function makeRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = res.headers['content-type']?.includes('json') ? JSON.parse(data) : data;
          resolve({ status: res.statusCode, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('===========================================================================');
  console.log('WeatherPulse Stage 1: Public Weather API & Swagger Verification');
  console.log('===========================================================================');

  const tests = [
    { name: "Swagger UI Page", path: "/swagger-ui" },
    { name: "OpenAPI 3.0 JSON Spec", path: "/openapi.json" },
    { name: "Current Weather (New Delhi)", path: "/api/v1/weather/current?city=New%20Delhi" },
    { name: "Current Weather (London, Imperial Units)", path: "/api/v1/weather/current?city=London&units=imperial" },
    { name: "7-Day Forecast (Mumbai)", path: "/api/v1/weather/forecast?city=Mumbai&days=7" },
    { name: "Weather History (New Delhi)", path: "/api/v1/weather/history?city=New%20Delhi" },
    { name: "Countries Weather Summary", path: "/api/v1/weather/countries" },
    { name: "Continents Weather Summary", path: "/api/v1/weather/continents" },
    { name: "India State-Wise Telemetry", path: "/api/v1/weather/states?country=IN" },
    { name: "Paginated Reports Feed", path: "/api/v1/reports?page=1&limit=5" },
    { name: "Active 72h Early Warning Alerts", path: "/api/v1/alerts/active" },
    { name: "Global Live Disasters (GDACS/USGS)", path: "/api/v1/disasters" },
    { name: "API Auth (Valid Key)", path: "/api/v1/weather/current?city=Bengaluru", headers: { 'X-API-Key': 'wp_live_global_key_2026_gov' } },
    { name: "API Auth (Invalid Key - Expect 401)", path: "/api/v1/weather/current?city=Bengaluru", headers: { 'X-API-Key': 'invalid_secret_key_123' }, expectStatus: 401 }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const start = Date.now();
      const res = await makeRequest(t.path, t.headers);
      const elapsed = Date.now() - start;
      const expected = t.expectStatus || 200;

      if (res.status === expected) {
        console.log(`[PASS] ${t.name.padEnd(45)} Status: ${res.status} (${elapsed}ms)`);
        if (t.path === "/api/v1/weather/current?city=New%20Delhi") {
          console.log(`       -> Sample New Delhi: Temp: ${res.data?.data?.temperature}°C, Cond: ${res.data?.data?.condition}, Stale: ${res.data?.data?.stale}`);
        }
        if (t.path === "/api/v1/weather/current?city=London&units=imperial") {
          console.log(`       -> Sample London (Imperial): Temp: ${res.data?.data?.temperature}°F, Wind: ${res.data?.data?.wind_speed} mph`);
        }
        if (t.path === "/api/v1/disasters") {
          console.log(`       -> Sample Disaster Feed Count: ${res.data?.count} events`);
        }
        passed++;
      } else {
        console.error(`[FAIL] ${t.name} Expected status ${expected}, got ${res.status}`);
      }
    } catch (e) {
      console.error(`[ERROR] ${t.name}: ${e.message}`);
    }
  }

  console.log('===========================================================================');
  console.log(`STAGE 1 VERIFICATION RESULT: ${passed} / ${tests.length} tests passed.`);
  console.log('===========================================================================');
}

testAllEndpoints();
