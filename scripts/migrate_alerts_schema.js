const { Client } = require('pg');

async function migrate() {
  const c = new Client({ host: 'localhost', port: 5433, user: 'postgres', password: 'radhika', database: 'weatherpulse' });
  await c.connect();

  await c.query(`
    ALTER TABLE alerts ADD COLUMN IF NOT EXISTS severity VARCHAR(50);
    ALTER TABLE alerts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
    ALTER TABLE alerts ADD COLUMN IF NOT EXISTS message TEXT;
    ALTER TABLE alerts ADD COLUMN IF NOT EXISTS type VARCHAR(50);
    UPDATE alerts SET severity = COALESCE(severity_color, severity_level, 'ORANGE') WHERE severity IS NULL;
    UPDATE alerts SET expires_at = COALESCE(end_time, created_at + INTERVAL '24 hours') WHERE expires_at IS NULL;
    UPDATE alerts SET message = COALESCE(description, headline) WHERE message IS NULL;
    UPDATE alerts SET type = COALESCE(hazard, 'WEATHER_HAZARD') WHERE type IS NULL;
  `);

  console.log('Alerts schema updated successfully.');
  await c.end();
}

migrate().catch(e => console.error(e));
