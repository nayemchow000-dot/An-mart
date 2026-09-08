const fetch = require('node-fetch');

async function test() {
  const payload = {
    pixel_code: 'DAFPP3JC77UES974O46G',
    event: 'ViewContent',
    event_id: '123456',
    timestamp: new Date().toISOString(),
    context: {
       page: { url: 'https://example.com' }
    }
  };

  const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
    method: 'POST',
    headers: {
      'Access-Token': 'dummy_token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
