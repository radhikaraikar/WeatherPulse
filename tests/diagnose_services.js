/**
 * WeatherPulse India — Stage 0 Diagnostic Suite
 * Checks all service healths, weather endpoints, DB tables, and Auth registration
 */

let Client;
try {
  Client = require('./services/report-service/node_modules/pg').Client;
} catch (_) {
  try {
    Client = require('pg').Client;
  } catch (_) {}
}

async function runDiagnostics() {
  console.log("===========================================================================");
  console.log("STAGE 0: SYSTEM DIAGNOSTICS REPORT");
  console.log("===========================================================================\n");

  // 1. Service Health Checks
  console.log("--- 1. Service Health Checks ---");
  const services = [
    { name: "report-service (REST API)", url: "http://localhost:8080/health" },
    { name: "ml-service (Flask AI)", url: "http://localhost:5000/health" },
    { name: "realtime-service (WebSocket)", url: "http://localhost:4000/health" },
    { name: "frontend (Docker Nginx Port 80)", url: "http://localhost:80" },
    { name: "frontend (Local Port 8000)", url: "http://localhost:8000" }
  ];

  for (const s of services) {
    try {
      const res = await fetch(s.url);
      const text = await res.text();
      console.log(`[STATUS] ${s.name.padEnd(35)}: ${res.status === 200 ? 'UP (200 OK)' : 'HTTP ' + res.status} | Body: ${text.substring(0, 60)}`);
    } catch (err) {
      console.log(`[STATUS] ${s.name.padEnd(35)}: DOWN (${err.message})`);
    }
  }

  // 2. Weather Endpoint Check
  console.log("\n--- 2. Weather Endpoints Check ---");
  try {
    const res = await fetch("http://localhost:8080/api/weather/cities");
    console.log(`GET /api/weather/cities Status: ${res.status}`);
    const text = await res.text();
    console.log(`Raw Response Preview: ${text.substring(0, 200)}...\n`);
  } catch (err) {
    console.log(`GET /api/weather/cities Error: ${err.message}`);
  }

  try {
    const res = await fetch("http://localhost:8080/api/weather/location?lat=28.6139&lng=77.2090");
    console.log(`GET /api/weather/location Status: ${res.status}`);
    const text = await res.text();
    console.log(`Raw Response Preview: ${text.substring(0, 200)}...\n`);
  } catch (err) {
    console.log(`GET /api/weather/location Error: ${err.message}`);
  }

  // 3. User Registration Check
  console.log("--- 3. User Registration API Test ---");
  const testEmail = `diagnose.${Date.now()}@weatherpulse.in`;
  const regPayload = {
    full_name: "Dr. Diagnostic Officer",
    email: testEmail,
    password: "Password@2026",
    confirm_password: "Password@2026",
    state: "Maharashtra",
    accept_terms: true
  };

  try {
    const res = await fetch("http://localhost:8080/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regPayload)
    });
    console.log(`POST /api/auth/signup Status: ${res.status}`);
    const text = await res.text();
    console.log(`Registration Response: ${text}`);
  } catch (err) {
    console.log(`POST /api/auth/signup Error: ${err.message}`);
  }

  // 4. PostgreSQL Database Tables Check
  console.log("\n--- 4. PostgreSQL Database Inspection ---");
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/weatherpulse_db"
  });

  try {
    await pgClient.connect();
    console.log("[DB] Successfully connected to PostgreSQL (weatherpulse_db)");

    const tablesRes = await pgClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log(`[DB] Tables found in database (${tableNames.length}):`, tableNames.join(', '));

    const requiredTables = ['users', 'reports', 'sources', 'moderation_log', 'weather_current', 'weather_forecast_daily', 'alerts'];
    requiredTables.forEach(t => {
      const exists = tableNames.includes(t);
      console.log(`   - Table '${t}': ${exists ? 'EXISTS' : 'MISSING'}`);
    });

    await pgClient.end();
  } catch (err) {
    console.log(`[DB] Postgres Connection Status: ${err.message}`);
  }

  console.log("\n===========================================================================");
  console.log("DIAGNOSTICS COMPLETED");
  console.log("===========================================================================");
}

runDiagnostics();
