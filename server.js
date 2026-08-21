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

app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SikoRadio Proxy</title>
    <style>
      :root { color-scheme: dark; font-family: system-ui, sans-serif; }
      body { min-height: 100vh; display: grid; place-items: center; margin: 0; background: #101827; color: #f8fafc; }
      main { width: min(90vw, 520px); padding: 40px; text-align: center; border: 1px solid #334155; border-radius: 20px; background: #172033; box-shadow: 0 20px 60px #02061766; }
      h1 { margin: 0 0 12px; font-size: 2rem; }
      p { margin: 0 0 28px; color: #cbd5e1; line-height: 1.6; }
      audio { width: 100%; }
      .status { margin-top: 16px; font-size: .9rem; color: #7dd3fc; }
    </style>
  </head>
  <body>
    <main>
      <h1>SikoRadio</h1>
      <p>Proxy de radio en funcionamiento. Pulsa reproducir para escuchar la transmisión.</p>
      <audio controls preload="none" src="/stream">Tu navegador no soporta audio HTML5.</audio>
      <div class="status">Conexión disponible</div>
    </main>
  </body>
</html>`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SikoRadio proxy running on port ${port}`));
