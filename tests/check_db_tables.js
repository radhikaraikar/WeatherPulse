const { Client } = require('pg');

async function checkDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password', // check postgres password
    database: 'weatherpulse_db'
  });

  // Try standard passwords: 'password', 'postgres'
  const passwords = ['postgres', 'password', 'postgres_password'];
  let connected = false;

  for (const pwd of passwords) {
    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pwd,
      database: 'weatherpulse_db'
    });

    try {
      await testClient.connect();
      console.log(`[DB] Connected successfully to PostgreSQL using password: '${pwd}'`);
      
      const tablesRes = await testClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      const tables = tablesRes.rows.map(r => r.table_name);
      console.log(`[DB] Public Tables (${tables.length}):`, tables.join(', '));

      // Check users count
      if (tables.includes('users')) {
        const usersCount = await testClient.query('SELECT COUNT(*) FROM users;');
        console.log(`[DB] Users table rows count:`, usersCount.rows[0].count);
      }

      // Check reports count
      if (tables.includes('reports')) {
        const reportsCount = await testClient.query('SELECT COUNT(*) FROM reports;');
        console.log(`[DB] Reports table rows count:`, reportsCount.rows[0].count);
      }

      await testClient.end();
      connected = true;
      break;
    } catch (err) {
      // try next password
    }
  }

  if (!connected) {
    console.log('[DB] Could not connect directly to localhost:5432 PostgreSQL. (Container might be starting or using custom password)');
  }
}

checkDatabase();
