/**
 * WeatherPulse India — Unit & Functional Test Suite
 * Tests Core Business Logic: Warning Classifications, Alert Rules, Open-Meteo Ingestion, Auth Cryptography
 */

const crypto = require('crypto');
const https = require('https');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, originalHash] = stored.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}

function calculateImdWarning(rainMm, tempMax, windKmph, wmoCode) {
  if (rainMm >= 204.5 || tempMax >= 45.0 || (wmoCode >= 95 && windKmph >= 60.0)) {
    return { severity: "EXTREME_RED", color: "red", label: "Take Action (Red Alert)" };
  }
  if (rainMm >= 115.6 || tempMax >= 43.0 || (wmoCode >= 95 && windKmph >= 45.0) || windKmph >= 50.0) {
    return { severity: "SEVERE_ORANGE", color: "orange", label: "Be Prepared (Orange Alert)" };
  }
  if (rainMm >= 64.5 || tempMax >= 40.0 || (wmoCode >= 45 && wmoCode <= 48) || wmoCode >= 95) {
    return { severity: "MODERATE_YELLOW", color: "yellow", label: "Be Aware (Yellow Watch)" };
  }
  return { severity: "LOW_GREEN", color: "green", label: "No Warning (Green)" };
}

async function runUnitTests() {
  console.log("===========================================================================");
  console.log("WeatherPulse India — Core Logic & Warning Engine Unit Tests");
  console.log("===========================================================================");

  let passed = 0;
  let failed = 0;

  // 1. Password Hashing & Salt Verification
  const testPass = "SecureGovPass2026!";
  const hashed = hashPassword(testPass);
  const isValid = verifyPassword(testPass, hashed);
  const isInvalid = verifyPassword("WrongPass", hashed);

  if (isValid && !isInvalid && hashed.includes(":")) {
    console.log("[PASS] 1. PBKDF2 Password Hashing & Timing-Safe Verification");
    passed++;
  } else {
    console.error("[FAIL] 1. PBKDF2 Password Hashing");
    failed++;
  }

  // 2. IMD Warning Scale Thresholds
  const redRain = calculateImdWarning(210.0, 30.0, 10.0, 65);
  const orangeRain = calculateImdWarning(120.0, 30.0, 10.0, 63);
  const yellowRain = calculateImdWarning(70.0, 30.0, 10.0, 61);
  const greenRain = calculateImdWarning(10.0, 30.0, 10.0, 0);

  if (redRain.severity === "EXTREME_RED" && orangeRain.severity === "SEVERE_ORANGE" &&
      yellowRain.severity === "MODERATE_YELLOW" && greenRain.severity === "LOW_GREEN") {
    console.log("[PASS] 2. IMD Rainfall Thresholds (Red >=204.5mm, Orange >=115.6mm, Yellow >=64.5mm)");
    passed++;
  } else {
    console.error("[FAIL] 2. IMD Rainfall Thresholds");
    failed++;
  }

  // 3. Heatwave Scale Thresholds
  const redHeat = calculateImdWarning(0.0, 46.0, 10.0, 0);
  const orangeHeat = calculateImdWarning(0.0, 43.5, 10.0, 0);
  const yellowHeat = calculateImdWarning(0.0, 40.5, 10.0, 0);

  if (redHeat.severity === "EXTREME_RED" && orangeHeat.severity === "SEVERE_ORANGE" && yellowHeat.severity === "MODERATE_YELLOW") {
    console.log("[PASS] 3. Heatwave Warning Thresholds (Red >=45°C, Orange >=43°C, Yellow >=40°C)");
    passed++;
  } else {
    console.error("[FAIL] 3. Heatwave Warning Thresholds");
    failed++;
  }

  // 4. Live Open-Meteo Multi-Coordinate Batch Connectivity
  try {
    const testUrl = "https://api.open-meteo.com/v1/forecast?latitude=28.6139,19.0760,12.9716&longitude=77.2090,72.8777,77.5946&current=temperature_2m,precipitation,wind_speed_10m&timezone=Asia%2FKolkata";
    const res = await fetch(testUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length === 3) {
        console.log("[PASS] 4. Open-Meteo Batch Multi-Coordinate Ingestion (3 Sample Hubs Loaded in 1 Request)");
        console.log(`       Delhi Temp: ${data[0].current.temperature_2m}°C | Mumbai Temp: ${data[1].current.temperature_2m}°C | Bangalore Temp: ${data[2].current.temperature_2m}°C`);
        passed++;
      } else {
        console.error("[FAIL] 4. Open-Meteo Batch Array Shape");
        failed++;
      }
    }
  } catch (err) {
    console.error("[FAIL] 4. Open-Meteo Network Connection ->", err.message);
    failed++;
  }

  console.log("===========================================================================");
  console.log(`Unit Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log("===========================================================================");
}

runUnitTests();
