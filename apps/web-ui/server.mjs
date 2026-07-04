import { createServer } from 'node:http';

const port = process.env.PORT || 3000;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI Synthetic Monitor</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, system-ui, sans-serif; }
      body { margin: 0; background: radial-gradient(circle at top, #1b2240, #050816 70%); color: #f5f7ff; }
      main { max-width: 1120px; margin: 0 auto; padding: 48px 24px 80px; }
      .hero { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; align-items: center; }
      .card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
      .pill { display:inline-flex; padding: 8px 12px; border-radius:999px; background: rgba(138,92,246,0.25); color:#d4bcff; margin-bottom: 16px; }
      h1 { font-size: 2.3rem; margin: 0 0 16px; }
      p { line-height: 1.6; color: #c5cfea; }
      .grid { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:16px; margin-top: 24px; }
      .metric { padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.06); }
      .metric strong { font-size: 1.35rem; display:block; margin-bottom:6px; }
      ul { padding-left: 18px; color:#c5cfea; }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="card">
          <div class="pill">AI-Driven Synthetic Monitoring</div>
          <h1>Modern, autonomous Playwright monitoring for every deployment.</h1>
          <p>Commit-driven deployment intelligence, auto-generated Playwright suites, automated artifact capture, and AI root cause insights are surfaced in one polished operations console.</p>
        </div>
        <div class="card">
          <h3>Live Platform Modules</h3>
          <ul>
            <li>Deployment Intelligence Agent</li>
            <li>Playwright Execution Engine</li>
            <li>Root Cause Agent</li>
            <li>Operations Dashboard</li>
          </ul>
        </div>
      </section>
      <section class="grid">
        <div class="metric"><strong>94%</strong> Risk Visibility</div>
        <div class="metric"><strong>100%</strong> Artifact Capture</div>
        <div class="metric"><strong>24/7</strong> AI Review</div>
      </section>
    </main>
  </body>
</html>`;

createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(port, () => {
  console.log(`Web UI listening on http://localhost:${port}`);
});
