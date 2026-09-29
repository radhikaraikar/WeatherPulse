require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'weatherpulse_db'
});

async function main() {
  const tables = ['cities', 'weather_observations', 'weather_forecasts', 'alerts', 'sync_log', 'weather_current', 'weather_forecast_daily'];
  for (const t of tables) {
    const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1;`, [t]);
    const cnt = await pool.query(`SELECT count(*) FROM ${t};`);
    console.log(`Table ${t} (Count: ${cnt.rows[0].count}):`, cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }
  await pool.end();
}

main().catch(console.error);
