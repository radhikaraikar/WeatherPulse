const { Pool } = require('./services/report-service/node_modules/pg');
const pool = new Pool({ host: 'localhost', port: 5433, user: 'postgres', password: 'radhika', database: 'weatherpulse' });

async function proof4() {
  console.log("=== 4. Analytics SQL Aggregation Query: State-Wise Weather Metrics ===");
  const query = `
    SELECT 
      c.state,
      COUNT(c.id) as total_stations,
      ROUND(AVG(o.temperature)::numeric, 1) as avg_temp_c,
      ROUND(MAX(o.temperature)::numeric, 1) as max_temp_c,
      ROUND(MIN(o.temperature)::numeric, 1) as min_temp_c,
      ROUND(AVG(o.humidity)::numeric, 0) as avg_humidity_pct,
      ROUND(SUM(COALESCE(o.precipitation, 0))::numeric, 1) as total_rainfall_mm
    FROM cities c
    JOIN LATERAL (
      SELECT * FROM weather_observations 
      WHERE city_id = c.id 
      ORDER BY fetched_at DESC LIMIT 1
    ) o ON true
    WHERE c.country_code = 'IN' AND c.state IS NOT NULL
    GROUP BY c.state
    ORDER BY avg_temp_c DESC
    LIMIT 15;
  `;

  console.log("Executed Query:\n" + query);
  const dbRes = await pool.query(query);
  console.table(dbRes.rows);

  await pool.end();
}

proof4().catch(console.error);
