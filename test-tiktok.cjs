const https = require('https');

const payload = JSON.stringify({
  pixel_code: 'DAFPP3JC77UES974O46G',
  event: 'ViewContent',
  event_id: '123456',
  timestamp: new Date().toISOString(),
  context: {
     page: { url: 'https://example.com' }
  }
});

const options = {
  hostname: 'business-api.tiktok.com',
  port: 443,
  path: '/open_api/v1.3/pixel/track/',
  method: 'POST',
  headers: {
    'Access-Token': 'dummy_token',
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', (e) => console.error(e));
req.write(payload);
req.end();
