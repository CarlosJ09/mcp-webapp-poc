// Direct API connectivity test
const testUrl = 'https://server-api-thryv.onrender.com/items';

console.log('Testing direct fetch to:', testUrl);

fetch(testUrl, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'MCP-Dashboard-Server/1.0.0'
  }
})
.then(response => {
  console.log('✅ Response status:', response.status);
  console.log('✅ Response headers:', Object.fromEntries(response.headers));
  return response.json();
})
.then(data => {
  console.log('✅ Data received, items count:', Array.isArray(data) ? data.length : 'Not an array');
  console.log('✅ First item:', Array.isArray(data) ? data[0] : data);
})
.catch(error => {
  console.error('❌ Fetch failed:', error.name, ':', error.message);
  console.error('❌ Error stack:', error.stack);
});
