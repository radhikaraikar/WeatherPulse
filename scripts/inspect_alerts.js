const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/weatherpulse'
});

async function main() {
  const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'alerts'");
  console.log('ALERTS COLUMNS:', cols.rows);
  const cities = await pool.query("SELECT id, name, state, country_code, latitude, longitude FROM cities WHERE country_code = 'IN' LIMIT 10");
  console.log('SAMPLE CITIES:', cities.rows);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
