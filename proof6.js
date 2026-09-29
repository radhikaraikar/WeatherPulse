const http = require('http');
const { Pool } = require('./services/report-service/node_modules/pg');
const pool = new Pool({ host: 'localhost', port: 5433, user: 'postgres', password: 'radhika', database: 'weatherpulse' });

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function proof6() {
  console.log("=== 6. SMS & Email Alert Subscriber + Notification Proof ===");

  // 1. Subscribe
  const subRes = await postJson('/api/v1/subscribers', {
    name: 'Radhika Test Observer',
    phone: '+919876543210',
    email: 'radhika.test@weatherpulse.in',
    state: 'Maharashtra',
    channel: 'SMS',
    min_severity: 'ORANGE'
  });
  console.log('\n[Step 1: Subscription Created]');
  console.log(subRes.body);

  const otp = subRes.body.subscriber?.otp_sample || '123456';

  // 2. Verify OTP
  const otpRes = await postJson('/api/v1/subscribers/verify-otp', {
    phone: '+919876543210',
    otp: otp
  });
  console.log('\n[Step 2: OTP Verification]');
  console.log(otpRes.body);

  // 3. Trigger Test Broadcast Alert
  const bcastRes = await postJson('/api/v1/notifications/broadcast', {
    headline: 'Very Heavy Rainfall Warning',
    message: 'Torrential convective downpours expected over Mumbai Metropolitan Region in next 12 hours.',
    severity: 'ORANGE',
    state: 'Maharashtra'
  });
  console.log('\n[Step 3: Alert Broadcast Triggered]');
  console.log(bcastRes.body);

  // 4. Query Notifications Row in DB
  const notifRes = await pool.query(`
    SELECT n.id, n.subscriber_id, s.name as subscriber, n.channel, n.recipient, n.status, n.message, n.attempts, n.sent_at
    FROM notifications n
    JOIN subscribers s ON s.id = n.subscriber_id
    WHERE n.recipient = '+919876543210'
    ORDER BY n.created_at DESC LIMIT 5;
  `);
  console.log('\n[Step 4: Notifications Table Records in PostgreSQL]');
  console.table(notifRes.rows);

  await pool.end();
}

proof6().catch(console.error);
