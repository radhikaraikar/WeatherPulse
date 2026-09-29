/**
 * WeatherPulse Global Reference Data Ingestion Script
 * Loads:
 * 1. Countries (ISO2, ISO3, Continent, Region, Capital, Lat/Lon, Population)
 * 2. World Country Boundaries GeoJSON (Natural Earth / World GeoJSON)
 * 3. Real GeoNames World Cities (>250k population, ~2,400+ cities)
 * 4. Real GDACS & USGS Live Disasters
 * 5. Default Developer API Key
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { Client } = require('pg');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5433', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'radhika';
const DB_NAME = process.env.DB_NAME || 'weatherpulse';

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'WeatherPulse-Global/2.0', ...headers } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location, headers));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function loadCountries(client) {
  console.log('[STAGE 0] 1. Loading Real Global Countries Dataset...');
  const csvUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/csv/countries.csv';
  const csvData = await fetchUrl(csvUrl);
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Basic CSV parse handling quotes
    const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const cleanCols = cols.map(c => c ? c.replace(/^"|"$/g, '').trim() : '');
    
    const name = cleanCols[1];
    const iso3 = cleanCols[2];
    const iso2 = cleanCols[3];
    const capital = cleanCols[6];
    const continent = cleanCols[14] || 'Global';
    const region = cleanCols[16] || continent;
    const lat = parseFloat(cleanCols[23]) || 0;
    const lon = parseFloat(cleanCols[24]) || 0;
    const pop = parseInt(cleanCols[12], 10) || 1000000;

    if (iso2 && iso3 && name) {
      await client.query(`
        INSERT INTO countries (iso2, iso3, name, continent, region, capital, latitude, longitude, population)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (iso2) DO UPDATE SET
          iso3 = EXCLUDED.iso3,
          name = EXCLUDED.name,
          continent = EXCLUDED.continent,
          region = EXCLUDED.region,
          capital = EXCLUDED.capital,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          population = EXCLUDED.population;
      `, [iso2, iso3, name, continent, region, capital, lat, lon, pop]);
      count++;
    }
  }
  console.log(`[STAGE 0] Loaded ${count} global countries.`);
}

async function loadGeoJsonBoundaries(client) {
  console.log('[STAGE 0] 2. Loading World Country Boundaries (GeoJSON)...');
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const geoJsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
  const geoJsonText = await fetchUrl(geoJsonUrl);
  const geoJson = JSON.parse(geoJsonText);
  
  // Save local copy for direct fast web access
  const localGeoPath = path.join(dataDir, 'world_countries.geojson');
  fs.writeFileSync(localGeoPath, geoJsonText);
  console.log(`[STAGE 0] Saved local copy of GeoJSON at: ${localGeoPath}`);

  let inserted = 0;
  for (const feature of geoJson.features) {
    const iso2 = feature.properties?.['ISO3166-1-Alpha-2'] || feature.properties?.['iso_a2'] || feature.properties?.['ISO_A2'] || feature.id;
    const iso3 = feature.properties?.['ISO3166-1-Alpha-3'] || feature.properties?.['iso_a3'] || feature.properties?.['ISO_A3'];
    const name = feature.properties?.['name'] || feature.properties?.['ADMIN'] || feature.properties?.['name_long'];
    if (!iso2 || iso2 === '-99' || iso2.length !== 2) continue;

    await client.query(`
      INSERT INTO country_boundaries (iso2, iso3, name, geojson)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (iso2) DO UPDATE SET
        iso3 = EXCLUDED.iso3,
        name = EXCLUDED.name,
        geojson = EXCLUDED.geojson;
    `, [iso2.toUpperCase(), iso3, name, JSON.stringify(feature)]);
    inserted++;
  }
  console.log(`[STAGE 0] Loaded ${inserted} country boundaries into database.`);
}

async function loadGeoNamesCities(client) {
  console.log('[STAGE 0] 3. Loading Real GeoNames Cities (>250k Population)...');
  // Fetch from OpenDataSoft GeoNames public export
  const exportUrl = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/exports/json?where=population%3E250000';
  const jsonText = await fetchUrl(exportUrl);
  const records = JSON.parse(jsonText);

  console.log(`[STAGE 0] Fetched ${records.length} real cities from official GeoNames dataset.`);
  
  // Lookup map for country continents and names
  const countriesRes = await client.query('SELECT iso2, name, continent FROM countries');
  const countryMap = {};
  countriesRes.rows.forEach(c => {
    countryMap[c.iso2] = { name: c.name, continent: c.continent };
  });

  let insertedCount = 0;
  for (const r of records) {
    const cityName = r.name || r.ascii_name;
    const countryCode = r.country_code || 'UN';
    const lat = r.coordinates?.lat;
    const lon = r.coordinates?.lon;
    const pop = r.population || 250000;
    const timezone = r.timezone || 'UTC';
    const admin1 = r.label_en || r.admin1_code || '';
    const countryInfo = countryMap[countryCode] || { name: r.cou_name_en || 'Global', continent: 'Global' };

    if (!cityName || lat === undefined || lon === undefined) continue;

    // Create a deterministic city id (e.g. wp-city-us-new-york)
    const slug = `${countryCode.toLowerCase()}-${cityName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`.substring(0, 80);
    const cityId = `wp-city-${slug}`;

    await client.query(`
      INSERT INTO cities (id, name, state, latitude, longitude, country_code, country, continent, timezone, population, admin1)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        state = EXCLUDED.state,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        country_code = EXCLUDED.country_code,
        country = EXCLUDED.country,
        continent = EXCLUDED.continent,
        timezone = EXCLUDED.timezone,
        population = EXCLUDED.population,
        admin1 = EXCLUDED.admin1;
    `, [
      cityId,
      cityName,
      admin1 || countryInfo.name,
      parseFloat(lat).toFixed(4),
      parseFloat(lon).toFixed(4),
      countryCode,
      countryInfo.name,
      countryInfo.continent,
      timezone,
      pop,
      admin1
    ]);
    insertedCount++;
  }
  console.log(`[STAGE 0] Successfully loaded ${insertedCount} global cities into cities table.`);
}

async function loadDisasters(client) {
  console.log('[STAGE 0] 4. Fetching Real Global Disasters from GDACS & USGS...');
  // 1. USGS Earthquakes (M 4.5+ past 7 days)
  try {
    const usgsData = await fetchUrl('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson');
    const usgs = JSON.parse(usgsData);
    let usgsCount = 0;
    for (const f of usgs.features) {
      const id = `usgs-${f.id}`;
      const title = f.properties.title;
      const mag = f.properties.mag;
      const eventDate = new Date(f.properties.time);
      const lon = f.geometry.coordinates[0];
      const lat = f.geometry.coordinates[1];
      const severity = mag >= 6.5 ? 'Red' : (mag >= 5.5 ? 'Orange' : 'Yellow');

      await client.query(`
        INSERT INTO disasters (id, source, type, title, severity, magnitude, latitude, longitude, event_date, details)
        VALUES ($1, 'USGS', 'earthquake', $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          severity = EXCLUDED.severity,
          magnitude = EXCLUDED.magnitude,
          details = EXCLUDED.details;
      `, [id, title, severity, mag, lat, lon, eventDate, JSON.stringify(f.properties)]);
      usgsCount++;
    }
    console.log(`[STAGE 0] Ingested ${usgsCount} real earthquake events from USGS.`);
  } catch (err) {
    console.error(`[STAGE 0 USGS WARNING] ${err.message}`);
  }

  // 2. GDACS Global Disasters (Cyclones, Floods, Volcanoes, Droughts)
  try {
    const gdacsData = await fetchUrl('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=TC,FL,EQ,VO,DR');
    const gdacs = JSON.parse(gdacsData);
    let gdacsCount = 0;
    if (gdacs.features) {
      for (const f of gdacs.features) {
        const p = f.properties;
        const id = `gdacs-${p.eventtype}-${p.eventid}`;
        const typeMap = { 'TC': 'cyclone', 'FL': 'flood', 'EQ': 'earthquake', 'VO': 'volcano', 'DR': 'drought' };
        const type = typeMap[p.eventtype] || p.eventtype.toLowerCase();
        const title = p.name || p.htmldescription || `GDACS ${p.eventtype} Event`;
        const severity = p.alertlevel || 'Orange';
        const lat = f.geometry?.coordinates?.[1] || 0;
        const lon = f.geometry?.coordinates?.[0] || 0;
        const country = p.country || (p.affectedcountries?.[0]?.countryname) || 'Global';
        const iso2 = p.affectedcountries?.[0]?.iso2 || null;
        const eventDate = new Date(p.fromdate || Date.now());

        await client.query(`
          INSERT INTO disasters (id, source, type, title, severity, magnitude, latitude, longitude, country_code, country_name, event_date, details)
          VALUES ($1, 'GDACS', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            severity = EXCLUDED.severity,
            details = EXCLUDED.details;
        `, [id, type, title, severity, p.alertscore || 1.0, lat, lon, iso2, country, eventDate, JSON.stringify(p)]);
        gdacsCount++;
      }
    }
    console.log(`[STAGE 0] Ingested ${gdacsCount} real disaster events from GDACS.`);
  } catch (err) {
    console.error(`[STAGE 0 GDACS WARNING] ${err.message}`);
  }
}

async function seedDefaultApiKey(client) {
  console.log('[STAGE 0] 5. Creating Default Developer API Key...');
  const testKey = 'wp_live_global_key_2026_gov';
  const keyHash = crypto.createHash('sha256').update(testKey).digest('hex');
  
  await client.query(`
    INSERT INTO api_keys (key_hash, key_prefix, name, owner_email, rate_limit_per_min, is_active)
    VALUES ($1, 'wp_live_g', 'WeatherPulse Official Demo API Key', 'developer@weatherpulse.gov.in', 120, TRUE)
    ON CONFLICT (key_hash) DO UPDATE SET
      rate_limit_per_min = 120,
      is_active = TRUE;
  `, [keyHash]);
  console.log(`[STAGE 0] Seeded Developer API Key: ${testKey} (Hash: ${keyHash.substring(0, 16)}...)`);
}

async function main() {
  console.log('===========================================================================');
  console.log('WeatherPulse Stage 0: Global Reference Data Ingestion');
  console.log('===========================================================================');
  
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });

  try {
    await client.connect();
    console.log(`Connected to PostgreSQL ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);

    await loadCountries(client);
    await loadGeoJsonBoundaries(client);
    await loadGeoNamesCities(client);
    await loadDisasters(client);
    await seedDefaultApiKey(client);

    const stats = await client.query(`
      SELECT 
        (SELECT count(*) FROM countries) as total_countries,
        (SELECT count(*) FROM country_boundaries) as total_boundaries,
        (SELECT count(*) FROM cities) as total_cities,
        (SELECT count(*) FROM disasters) as total_disasters,
        (SELECT count(*) FROM api_keys) as total_api_keys;
    `);
    
    console.log('\n===========================================================================');
    console.log('STAGE 0 GLOBAL FOUNDATION READY:');
    console.log(`   Countries:          ${stats.rows[0].total_countries}`);
    console.log(`   Boundaries:         ${stats.rows[0].total_boundaries}`);
    console.log(`   Cities in Database: ${stats.rows[0].total_cities}`);
    console.log(`   Global Disasters:   ${stats.rows[0].total_disasters}`);
    console.log(`   API Keys:           ${stats.rows[0].total_api_keys}`);
    console.log('===========================================================================');

    await client.end();
  } catch (err) {
    console.error(`[FATAL ERROR IN STAGE 0] ${err.message}`, err.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
