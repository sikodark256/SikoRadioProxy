const express = require('express');
const http = require('http');
const https = require('https');
const url = require('url');

const app = express();
const UPSTREAM = process.env.UPSTREAM_STREAM || 'http://uk14freenew.listen2myradio.com:15193/stream';

app.get('/stream', (req, res) => {
  const upstream = url.parse(UPSTREAM);
  const options = {
    hostname: upstream.hostname,
    port: upstream.port || (upstream.protocol === 'https:' ? 443 : 80),
    path: upstream.path,
    headers: {
      'Icy-MetaData': '1',
      'User-Agent': 'WinampMPEG/5.09'
    }
  };

  const client = (upstream.protocol === 'https:' ? https : http).request(options, (upRes) => {
    res.writeHead(upRes.statusCode || 200, upRes.headers);
    upRes.pipe(res);
  });

  client.on('error', (err) => {
    console.error('Error upstream:', err.message);
    if (!res.headersSent) res.status(502).send('Bad Gateway');
    else res.end();
  });

  req.on('close', () => client.abort());
  client.end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SikoRadio proxy running on port ${port}`));
