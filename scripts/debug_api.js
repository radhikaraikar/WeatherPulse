const http = require('http');

async function test(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8080${path}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(path, 'Status:', res.statusCode, 'Body:', data.substring(0, 300));
        resolve();
      });
    });
  });
}

async function run() {
  await test('/api/v1/weather/countries');
  await test('/api/v1/weather/continents');
  await test('/api/v1/weather/states?country=IN');
  await test('/api/v1/alerts/active');
}
run();
