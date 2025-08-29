// Test de conectividad usando native https
import https from 'https';
import { URL } from 'url';

const url = 'https://server-api-thryv.onrender.com/items';

console.log('Testing native https to:', url);

const urlObj = new URL(url);

const options = {
  hostname: urlObj.hostname,
  port: 443,
  path: urlObj.pathname,
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js HTTPS Client',
    'Accept': 'application/json'
  },
  // Handle SSL certificate verification
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  console.log('✅ Response status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Data received, items count:', Array.isArray(jsonData) ? jsonData.length : 'Not an array');
      console.log('✅ First item:', Array.isArray(jsonData) ? jsonData[0] : jsonData);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError.message);
    }
  });
});

req.on('timeout', () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.name, ':', error.message);
});

req.setTimeout(30000);
req.end();
