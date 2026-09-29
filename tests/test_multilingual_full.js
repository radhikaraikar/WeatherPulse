/**
 * WeatherPulse India - Multilingual 6-Language Test Suite
 * Validates complete dictionary coverage & backend dispatch in:
 * Kannada (kn), English (en), Hindi (hi), Tamil (ta), Telugu (te), Malayalam (ml)
 */

const assert = require('assert');
const TRANSLATIONS = require('../translations.js');
const http = require('http');

const EXPECTED_LANGUAGES = ['en', 'hi', 'kn', 'ta', 'te', 'ml'];
const REQUIRED_KEYS = [
  'portal_title', 'ministry_name', 'app_name',
  'nav_home', 'nav_india', 'nav_world', 'nav_monsoon', 'nav_forecast',
  'nav_alerts', 'nav_analytics', 'nav_citizen', 'nav_moderation',
  'nav_login', 'nav_signup', 'nav_logout',
  'imd_warnings', 'imd_nowcast', 'ticker_label',
  'search_placeholder', 'temp', 'humidity', 'wind_speed', 'pressure', 'visibility',
  'hourly_forecast', 'weekly_forecast', 'radar_map',
  'alerts_title', 'subscribe_btn', 'broadcast_btn',
  'analytics_banner_title', 'kpi_stations', 'kpi_mean_temp', 'kpi_rainfall',
  'kpi_hazard_index', 'kpi_cape', 'kpi_verification',
  'radar_title', 'hazard_dist', 'sounding_title',
  'cond_clear', 'cond_sunny', 'cond_heavy_rain', 'cond_thunderstorm',
  'cond_cyclone', 'cond_heatwave', 'cond_flood'
];

async function runTests() {
  console.log("=== WEATHERPULSE MULTILINGUAL 6-LANGUAGE VERIFICATION ===");

  // 1. Validate All 6 Languages in translations.js
  console.log("\n[TEST 1] Verifying Translation Dictionaries...");
  for (const lang of EXPECTED_LANGUAGES) {
    assert(TRANSLATIONS[lang], `Missing translation dictionary for language code: ${lang}`);
    console.log(`  ✓ Language '${lang}' (${TRANSLATIONS[lang].lang_native} - ${TRANSLATIONS[lang].lang_name}) present`);

    let missingKeys = [];
    for (const key of REQUIRED_KEYS) {
      if (!TRANSLATIONS[lang][key]) {
        missingKeys.push(key);
      }
    }
    assert(missingKeys.length === 0, `Language '${lang}' missing keys: ${missingKeys.join(', ')}`);
    console.log(`    → All ${REQUIRED_KEYS.length} core keys fully translated`);
  }

  // 2. Test Multilingual Subscriber Registration in all 6 languages
  console.log("\n[TEST 2] Testing Subscriber Registration with all 6 languages via REST API...");
  for (const lang of EXPECTED_LANGUAGES) {
    const payload = JSON.stringify({
      name: `Tester ${lang.toUpperCase()}`,
      email: `tester.${lang}@weatherpulse.in`,
      phone: `+91987654321${EXPECTED_LANGUAGES.indexOf(lang)}`,
      country_code: 'IN',
      state: 'Karnataka',
      channel: 'BOTH',
      min_severity: 'YELLOW',
      language: lang
    });

    const res = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/subscribers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data || '{}')));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    assert(res.success === true, `Failed to subscribe in language '${lang}': ${res.error}`);
    console.log(`  ✓ Registered subscriber in '${lang}' (${TRANSLATIONS[lang].lang_native}) - ID: ${res.subscriber?.id}`);
  }

  // 3. Test Emergency Broadcast Dispatch
  console.log("\n[TEST 3] Testing Multi-Channel Broadcast Dispatch across Subscribers...");
  const bcastPayload = JSON.stringify({
    state: 'Karnataka',
    severity: 'EXTREME_RED',
    headline: 'Emergency Severe Weather Warning',
    message: 'Extreme precipitation and wind squall expected across district zones.'
  });

  const bcastRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/notifications/broadcast',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bcastPayload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data || '{}')));
    });
    req.on('error', reject);
    req.write(bcastPayload);
    req.end();
  });

  assert(bcastRes.success === true, `Broadcast failed: ${bcastRes.error}`);
  console.log(`  ✓ Broadcast successfully delivered to ${bcastRes.dispatched} verified multi-language subscribers.`);

  console.log("\n========================================================");
  console.log("🎉 ALL 6 LANGUAGES (KANNADA, ENGLISH, HINDI, TAMIL, TELUGU, MALAYALAM) VERIFIED 100%!");
  console.log("========================================================\n");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
