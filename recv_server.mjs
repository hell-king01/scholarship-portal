import http from 'http';
import fs from 'fs';

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        fs.writeFileSync('status_results.json', body);
        console.log('Results saved!');
        res.writeHead(200);
        res.end('OK');
    });
});

server.listen(3050, () => {
    console.log('Listening on 3050');
});
