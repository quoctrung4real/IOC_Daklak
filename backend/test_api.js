const http = require('http');

const payload = JSON.stringify({
    logoUrl: "",
    headerTextMain: "Test"
});

const req = http.request({
    hostname: 'localhost',
    port: 5045, // Assuming backend runs on 5045
    path: '/api/cau-hinh',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
}, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log('Response:', data));
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
