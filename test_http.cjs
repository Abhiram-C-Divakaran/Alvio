const http = require('http');

http.get('http://127.0.0.1:3000/api/problems', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('BODY:', data.substring(0, 500)); });
}).on('error', (e) => {
  console.error(`127.0.0.1 Error: ${e.message}`);
});

http.get('http://localhost:5173/api/problems', (res) => {
  console.log(`STATUS 5173: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('BODY 5173:', data.substring(0, 500)); });
}).on('error', (e) => {
  console.error(`5173 Error: ${e.message}`);
});
