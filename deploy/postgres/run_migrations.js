/**
 * WeatherPulse India — Database Migration Runner
 * Applies SQL migrations to local or containerized PostgreSQL instance
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runAllMigrations() {
  console.log("===========================================================================");
  console.log("Applying WeatherPulse Database Migrations to PostgreSQL");
  console.log("===========================================================================");

  const DB_HOST = process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost';
  const DB_PORT = parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5433', 10);
  const DB_USER = process.env.DB_USER || process.env.POSTGRES_USER || 'postgres';
  const DB_PASSWORD = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'radhika';
  const DB_NAME = process.env.DB_NAME || process.env.POSTGRES_DB || 'weatherpulse';

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

    const migrationFiles = [
      "01-init-postgis.sql",
      "02-migration-indexes-moderation.sql",
      "03-weather-alerts-schema.sql",
      "04-global-weather-schema.sql",
      "05-add-state-to-users.sql",
      "06-password-reset-schema.sql",
      "07-seed-analytics-data.sql",
      "08-seed-active-alerts.sql"
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`[MIGRATION] Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        await client.query(sql);
        console.log(`[MIGRATION] Successfully executed ${file}`);
      }
    }

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\n[MIGRATION] Complete Database Schema Tables in public:");
    tablesRes.rows.forEach((r, idx) => console.log(`   ${idx + 1}. ${r.table_name}`));

    const citiesCount = await client.query('SELECT count(*) FROM cities;');
    console.log(`[MIGRATION] Total reference cities seeded: ${citiesCount.rows[0].count}`);

    await client.end();
    console.log("\n===========================================================================");
    console.log("All Database Migrations Applied Successfully!");
    console.log("===========================================================================");
  } catch (err) {
    console.error(`[MIGRATION ERROR] Failed connecting to PostgreSQL ${DB_NAME} at ${DB_HOST}: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllMigrations();
}

module.exports = { runAllMigrations };
