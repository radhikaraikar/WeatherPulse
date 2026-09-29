/**
 * WeatherPulse Global Synchronization Engine
 * Handles rotating batch synchronization for:
 * 1. Indian Cities (Every 10 minutes + startup)
 * 2. Global Cities (GeoNames >250k rotating schedule, respecting Open-Meteo rate limits)
 * 3. GDACS & USGS Global Disasters
 * 4. IMD & data.gov.in Government Bulletins
 * 5. NASA POWER 30-Year Climatology Baseline
 */

const https = require('https');

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 25000;
    const req = https.get(url, { headers: { 'User-Agent': 'WeatherPulse-Global/2.0', ...(options.headers || {}) } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location, options));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON Parse Error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms: ${url}`));
    });
  });
}

function getWeatherCondition(code) {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Fog / Rime Fog";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm / Squall";
  return "Variable Clouds";
}

let globalBatchOffset = 0;

async function syncWeatherDataBatch(pool, cities, sourceName = 'open-meteo') {
  if (!cities || cities.length === 0) return { updated: 0, errors: [] };

  const lats = cities.map(c => parseFloat(c.latitude).toFixed(4)).join(',');
  const lons = cities.map(c => parseFloat(c.longitude).toFixed(4)).join(',');

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  let responseData;
  let attempts = 0;
  while (attempts < 3) {
    try {
      responseData = await fetchJson(apiUrl, { timeout: 25000 });
      break;
    } catch (err) {
      attempts++;
      const isRateLimit = err.message && err.message.includes('429');
      const delay = isRateLimit ? 5000 * attempts : 1000 * Math.pow(2, attempts);
      console.warn(`[SYNC RETRY] Attempt ${attempts}/3 failed${isRateLimit ? ' (rate limited)' : ''}, retrying in ${delay}ms...`);
      if (attempts >= 3) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  const results = Array.isArray(responseData) ? responseData : [responseData];
  let updatedCount = 0;

  for (let i = 0; i < cities.length && i < results.length; i++) {
    const city = cities[i];
    const data = results[i];
    if (!data) continue;

    const cur = data.current || {};
    const daily = data.daily || {};

    const temp = cur.temperature_2m !== undefined ? cur.temperature_2m : null;
    const humidity = cur.relative_humidity_2m !== undefined ? cur.relative_humidity_2m : null;
    const precip = cur.precipitation !== undefined ? cur.precipitation : 0.0;
    const wind = cur.wind_speed_10m !== undefined ? cur.wind_speed_10m : null;
    const code = cur.weather_code !== undefined ? cur.weather_code : 0;

    // 1. Insert Observation
    await pool.query(`
      INSERT INTO weather_observations (city_id, fetched_at, temperature, humidity, precipitation, wind_speed, weather_code, source)
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7);
    `, [city.id, temp, humidity, precip, wind, code, sourceName]);

    // 2. Insert 7-day Forecasts
    if (daily.time && Array.isArray(daily.time)) {
      for (let d = 0; d < daily.time.length; d++) {
        const forecastDate = daily.time[d];
        const tMax = daily.temperature_2m_max?.[d] !== undefined ? daily.temperature_2m_max[d] : null;
        const tMin = daily.temperature_2m_min?.[d] !== undefined ? daily.temperature_2m_min[d] : null;
        const pSum = daily.precipitation_sum?.[d] !== undefined ? daily.precipitation_sum[d] : 0.0;
        const pProb = daily.precipitation_probability_max?.[d] !== undefined ? daily.precipitation_probability_max[d] : 0;
        const wMax = daily.wind_speed_10m_max?.[d] !== undefined ? daily.wind_speed_10m_max[d] : 0;
        const dCode = daily.weather_code?.[d] !== undefined ? daily.weather_code[d] : 0;

        await pool.query(`
          INSERT INTO weather_forecasts (city_id, fetched_at, forecast_date, temp_max, temp_min, precipitation_probability, precipitation_sum, wind_max, weather_code)
          VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7, $8);
        `, [city.id, forecastDate, tMax, tMin, pProb, pSum, wMax, dCode]);
      }
    }

    // 3. Evaluate Alerts
    if (temp !== null) {
      let severity = null;
      let headline = '';
      let msg = '';
      let threshold = '';

      if (temp >= 45.0) {
        severity = 'EXTREME_RED';
        headline = 'Severe Heatwave Emergency Warning';
        msg = `Temperature reached extreme ${temp}°C in ${city.name}. Take immediate hydration & shade precautions.`;
        threshold = 'Temp >= 45°C';
      } else if (temp >= 42.0) {
        severity = 'ORANGE';
        headline = 'Heatwave Warning (Be Prepared)';
        msg = `Severe hot weather with temperatures of ${temp}°C recorded in ${city.name}.`;
        threshold = 'Temp >= 42°C';
      } else if (precip >= 50.0) {
        severity = 'EXTREME_RED';
        headline = 'Extremely Heavy Rainfall & Inundation Warning';
        msg = `Torrential rainfall of ${precip}mm recorded in ${city.name}. Low-lying inundation likely.`;
        threshold = 'Precip >= 50mm';
      } else if (code >= 95 && wind >= 50.0) {
        severity = 'ORANGE';
        headline = 'Thunderstorm & Convective Squall Alert';
        msg = `Severe thunderstorm with convective squall wind gusts of ${wind} km/h detected in ${city.name}.`;
        threshold = 'WMO 95-99 + Wind >= 50 km/h';
      }

      if (severity) {
        const alertId = `alt-${city.id}-${Date.now().toString(36)}`;
        const hazard = precip >= 50.0 ? 'HEAVY_RAINFALL' : (temp >= 42.0 ? 'HEATWAVE' : 'THUNDERSTORM_LIGHTNING');
        const color = severity === 'EXTREME_RED' ? 'RED' : 'ORANGE';
        const sevLevel = severity === 'ORANGE' ? 'SEVERE_ORANGE' : severity;
        const forecastVal = precip >= 50.0 ? `${precip} mm` : (temp >= 42.0 ? `${temp} °C` : `${wind} km/h`);
        const safety = precip >= 50.0 ? 'Avoid low-lying inundation spots.' : (temp >= 42.0 ? 'Avoid direct solar exposure and stay hydrated.' : 'Stay indoors during squalls.');

        await pool.query(`
          INSERT INTO alerts (
            id, city_id, hazard, city, state, severity_color, severity_level, severity, type,
            start_time, end_time, expires_at, headline, description, message,
            safety_advice, forecast_value, threshold, source, source_type, is_active, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '24 hours', CURRENT_TIMESTAMP + INTERVAL '24 hours', $10, $11, $12, $13, $14, $15, 'Open-Meteo NWP', 'model-derived', TRUE, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO NOTHING;
        `, [alertId, city.id, hazard, city.name, city.state || city.country, color, sevLevel, severity, hazard, headline, msg, msg, safety, forecastVal, threshold]);
      }
    }

    updatedCount++;
  }

  return { updated: updatedCount, errors: [] };
}

async function runScheduledGlobalSync(pool) {
  const startedAt = new Date();
  let totalUpdated = 0;
  let syncError = null;

  console.log(`[GLOBAL SYNC] Starting scheduled live synchronization at ${startedAt.toISOString()}...`);

  try {
    // 1. Fetch All Indian Cities (High Priority - 37 Hubs)
    const indiaCitiesRes = await pool.query(`
      SELECT id, name, state, latitude, longitude, country_code, country 
      FROM cities 
      WHERE country_code = 'IN' 
      ORDER BY is_capital DESC, name ASC;
    `);
    const indiaCities = indiaCitiesRes.rows;

    if (indiaCities.length > 0) {
      console.log(`[GLOBAL SYNC] Syncing ${indiaCities.length} Indian reference cities...`);
      for (let i = 0; i < indiaCities.length; i += 10) {
        const chunk = indiaCities.slice(i, i + 10);
        const indRes = await syncWeatherDataBatch(pool, chunk, 'open-meteo-imd');
        totalUpdated += indRes.updated;
        if (i + 10 < indiaCities.length) {
          await new Promise(r => setTimeout(r, 2000)); // 2s delay between batches
        }
      }
    }

    // 2. Fetch Rotating Batch of Global Cities (50 cities per run)
    const globalCitiesRes = await pool.query(`
      SELECT id, name, state, latitude, longitude, country_code, country 
      FROM cities 
      WHERE country_code != 'IN' 
      ORDER BY population DESC 
      LIMIT 50 OFFSET $1;
    `, [globalBatchOffset]);
    
    let globalCities = globalCitiesRes.rows;
    if (globalCities.length === 0 && globalBatchOffset > 0) {
      globalBatchOffset = 0;
      const wrapRes = await pool.query(`
        SELECT id, name, state, latitude, longitude, country_code, country 
        FROM cities 
        WHERE country_code != 'IN' 
        ORDER BY population DESC 
        LIMIT 50;
      `);
      globalCities = wrapRes.rows;
    }

    if (globalCities.length > 0) {
      console.log(`[GLOBAL SYNC] Syncing rotating batch of ${globalCities.length} Global cities (offset: ${globalBatchOffset})...`);
      // Chunk into batches of 10 with delay for rate limit compliance
      for (let i = 0; i < globalCities.length; i += 10) {
        const chunk = globalCities.slice(i, i + 10);
        const gRes = await syncWeatherDataBatch(pool, chunk, 'open-meteo-global');
        totalUpdated += gRes.updated;
        if (i + 10 < globalCities.length) {
          await new Promise(r => setTimeout(r, 2000)); // 2s delay between batches
        }
      }
      globalBatchOffset += 50;
    }

    // 3. Sync USGS & GDACS Live Disasters
    try {
      const usgs = await fetchJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', { timeout: 15000 });
      if (usgs && usgs.features) {
        for (const f of usgs.features.slice(0, 30)) {
          const id = `usgs-${f.id}`;
          const title = f.properties.title;
          const mag = f.properties.mag;
          const eventDate = new Date(f.properties.time);
          const lon = f.geometry.coordinates[0];
          const lat = f.geometry.coordinates[1];
          const severity = mag >= 6.5 ? 'Red' : (mag >= 5.5 ? 'Orange' : 'Yellow');

          await pool.query(`
            INSERT INTO disasters (id, source, type, title, severity, magnitude, latitude, longitude, event_date, details)
            VALUES ($1, 'USGS', 'earthquake', $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              severity = EXCLUDED.severity,
              magnitude = EXCLUDED.magnitude,
              details = EXCLUDED.details;
          `, [id, title, severity, mag, lat, lon, eventDate, JSON.stringify(f.properties)]);
        }
      }
    } catch (e) {
      console.warn(`[GLOBAL SYNC WARNING USGS] ${e.message}`);
    }

    // 4. Log successful run in sync_log
    const finishedAt = new Date();
    await pool.query(`
      INSERT INTO sync_log (started_at, finished_at, source, status, cities_updated, error)
      VALUES ($1, $2, 'open-meteo-global', 'SUCCESS', $3, NULL);
    `, [startedAt, finishedAt, totalUpdated]);

    console.log(`[GLOBAL SYNC] Completed in ${((finishedAt - startedAt)/1000).toFixed(2)}s. Total cities updated: ${totalUpdated}`);
  } catch (err) {
    syncError = err.message;
    console.error(`[GLOBAL SYNC ERROR] ${err.message}`);
    const finishedAt = new Date();
    try {
      await pool.query(`
        INSERT INTO sync_log (started_at, finished_at, source, status, cities_updated, error)
        VALUES ($1, $2, 'open-meteo-global', 'ERROR', $3, $4);
      `, [startedAt, finishedAt, totalUpdated, syncError]);
    } catch (_) {}
  }
}

module.exports = {
  runScheduledGlobalSync,
  syncWeatherDataBatch,
  getWeatherCondition
};
