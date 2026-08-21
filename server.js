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
    <meta name="theme-color" content="#101827" />
    <title>SikoRadio | Radio en directo</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; background: #101827; color: #f8fafc; }
      main { width: min(100%, 680px); overflow: hidden; border: 1px solid #2b3952; border-radius: 28px; background: #172033; box-shadow: 0 24px 80px #02061799; }
      header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 28px 32px; border-bottom: 1px solid #2b3952; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .mark { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 14px; background: #f26b5e; color: #101827; font-size: 21px; font-weight: 800; }
      .eyebrow { margin: 0 0 4px; color: #9eabc0; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
      h1 { margin: 0; font-size: 22px; letter-spacing: -.03em; }
      .live { display: inline-flex; align-items: center; gap: 7px; color: #a9e6c0; font-size: 13px; font-weight: 700; }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #66d391; box-shadow: 0 0 0 4px #66d39122; }
      section { padding: 42px 32px 36px; }
      .kicker { margin: 0 0 10px; color: #f26b5e; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      h2 { max-width: 460px; margin: 0; font-size: clamp(32px, 7vw, 54px); line-height: 1.02; letter-spacing: -.055em; }
      .description { max-width: 470px; margin: 18px 0 32px; color: #b4bfd0; font-size: 16px; line-height: 1.6; }
      audio { display: block; width: 100%; height: 52px; border-radius: 12px; }
      .footer { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; color: #8795ab; font-size: 12px; }
      @media (max-width: 520px) { body { padding: 12px; } header, section { padding-left: 22px; padding-right: 22px; } header { align-items: flex-start; flex-direction: column; } section { padding-top: 32px; } }
    </style>
  </head>
  <body>
    <main>
      <header><div class="brand"><div class="mark" aria-hidden="true">S</div><div><p class="eyebrow">Radio online</p><h1>SikoRadio</h1></div></div><div class="live"><span class="dot"></span>En directo</div></header>
      <section><p class="kicker">Tu música, siempre cerca</p><h2>Escucha SikoRadio en cualquier momento.</h2><p class="description">Conecta con nuestra transmisión en directo. Pulsa reproducir y disfruta de la radio desde tu navegador.</p><audio controls preload="none" src="/stream">Tu navegador no soporta audio HTML5.</audio><div class="footer"><span>Transmisión estable</span><span>Audio en directo</span></div></section>
    </main>
  </body>
</html>`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SikoRadio proxy running on port ${port}`));
