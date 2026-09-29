require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'weatherpulse_db'
});

async function testInsert() {
  try {
    console.log('Testing sync_log insert...');
    const logRes = await pool.query(
      'INSERT INTO sync_log (started_at, source, status) VALUES ($1, $2, $3) RETURNING id;',
      [new Date().toISOString(), 'Open-Meteo & IMD CDSP Telemetry', 'IN_PROGRESS']
    );
    console.log('sync_log insert success, id:', logRes.rows[0].id);

    console.log('Testing weather_observations insert...');
    const obsRes = await pool.query(`
      INSERT INTO weather_observations (
        city_id, fetched_at, temperature, humidity, precipitation, wind_speed, weather_code, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (city_id, fetched_at) DO UPDATE SET
        temperature = EXCLUDED.temperature
      RETURNING *;
    `, ['wp-city-new-delhi', new Date().toISOString(), 25.5, 60, 0, 10, 0, 'Open-Meteo']);
    console.log('weather_observations insert success:', obsRes.rows[0]);

    console.log('Testing weather_forecasts insert...');
    const fcRes = await pool.query(`
      INSERT INTO weather_forecasts (
        city_id, fetched_at, forecast_date, temp_max, temp_min,
        precipitation_probability, precipitation_sum, wind_max, weather_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (city_id, forecast_date, fetched_at) DO UPDATE SET
        temp_max = EXCLUDED.temp_max
      RETURNING *;
    `, ['wp-city-new-delhi', new Date().toISOString(), '2026-09-29', 32, 22, 10, 0, 12, 0]);
    console.log('weather_forecasts insert success:', fcRes.rows[0]);

  } catch (err) {
    console.error('Test insert error:', err);
  } finally {
    await pool.end();
  }
}

testInsert();
