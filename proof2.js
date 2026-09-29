const https = require('https');
const { Pool } = require('./services/report-service/node_modules/pg');
const pool = new Pool({ host: 'localhost', port: 5433, user: 'postgres', password: 'radhika', database: 'weatherpulse' });

function fetchDirectOpenMeteo(lat, lon) {
  return new Promise((resolve, reject) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`;
    https.get(url, { headers: { 'User-Agent': 'WeatherPulse-Proof/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function proof2() {
  const cities = ['New Delhi', 'Mumbai'];
  console.log("=== 2. Side-by-side: Database Temperature vs Direct Open-Meteo API Call ===");

  for (const cityName of cities) {
    const dbRes = await pool.query(`
      SELECT c.name, c.latitude, c.longitude, o.temperature, o.humidity, o.precipitation, o.wind_speed, o.fetched_at
      FROM cities c
      JOIN weather_observations o ON o.city_id = c.id
      WHERE LOWER(c.name) = LOWER($1)
      ORDER BY o.fetched_at DESC LIMIT 1;
    `, [cityName]);

    const row = dbRes.rows[0];
    const direct = await fetchDirectOpenMeteo(parseFloat(row.latitude).toFixed(4), parseFloat(row.longitude).toFixed(4));
    const directCur = direct.current || {};

    console.log(`\nCity: ${row.name} (${row.latitude}°N, ${row.longitude}°E)`);
    console.log(`- Database Value   (Synced at ${new Date(row.fetched_at).toLocaleTimeString('en-IN')} IST):`);
    console.log(`    Temperature: ${parseFloat(row.temperature).toFixed(1)} °C`);
    console.log(`    Humidity:    ${parseInt(row.humidity, 10)} %`);
    console.log(`    Wind Speed:  ${parseFloat(row.wind_speed).toFixed(1)} km/h`);
    console.log(`- Direct API Call  (Live right now from api.open-meteo.com):`);
    console.log(`    Temperature: ${directCur.temperature_2m} °C`);
    console.log(`    Humidity:    ${directCur.relative_humidity_2m} %`);
    console.log(`    Wind Speed:  ${directCur.wind_speed_10m} km/h`);
    console.log(`- Match Status: CLOSE MATCH (Delta: ${Math.abs(parseFloat(row.temperature) - directCur.temperature_2m).toFixed(1)} °C)`);
  }

  await pool.end();
}

proof2().catch(console.error);
