const https = require('https');

const payload = JSON.stringify({
  pixel_code: 'DAFPP3JC77UES974O46G',
  events: [
    {
      event: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      event_id: '12345',
      page: { url: 'https://example.com' },
      user: {},
      properties: {}
    }
  ]
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
