const { Pool } = require('./services/report-service/node_modules/pg');
const pool = new Pool({ host: 'localhost', port: 5433, user: 'postgres', password: 'radhika', database: 'weatherpulse' });

async function proof1() {
  const cityCount = await pool.query("SELECT count(*) FROM cities");
  console.log("=== 1. SELECT count(*) FROM cities ===");
  console.log("Total Cities in DB:", cityCount.rows[0].count);

  const obsRows = await pool.query(`
    SELECT o.city_id, c.name as city_name, c.state, o.temperature, o.humidity, o.precipitation, o.wind_speed, o.weather_code, o.source, o.fetched_at
    FROM weather_observations o
    JOIN cities c ON c.id = o.city_id
    ORDER BY o.fetched_at DESC
    LIMIT 10;
  `);
  console.log("\n=== Latest 10 rows of weather_observations joined to city names ===");
  console.table(obsRows.rows);

  const syncRows = await pool.query(`
    SELECT id, started_at, finished_at, source, status, cities_updated, error
    FROM sync_log
    ORDER BY started_at DESC
    LIMIT 5;
  `);
  console.log("\n=== Last 5 rows of sync_log ===");
  console.table(syncRows.rows);

  await pool.end();
}
proof1().catch(console.error);
