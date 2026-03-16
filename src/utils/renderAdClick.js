export function renderAdClick(adData) {
  const rows = Object.entries(adData)
    .map(
      ([key, value]) => `
      <div class="row">
        <span class="key">${key}</span>
        <span class="value">${value}</span>
      </div>
    `,
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>

  <head>
  <title>Ad Click Simulation</title>

  <style>

  body{
    margin:0;
    font-family:Arial, sans-serif;
    background:#f4f6f8;
  }

  header{
    background:#0f172a;
    color:white;
    padding:20px;
  }

  .container{
    max-width:900px;
    margin:auto;
    padding:40px;
  }

  .card{
    background:white;
    padding:30px;
    border-radius:8px;
    box-shadow:0 10px 30px rgba(0,0,0,0.1);
  }

  .row{
    display:flex;
    justify-content:space-between;
    border-bottom:1px solid #eee;
    padding:8px 0;
  }

  .key{
    font-weight:bold;
    color:#475569;
  }

  .value{
    font-family:monospace;
  }

  .notice{
    margin-top:20px;
    font-size:12px;
    color:#64748b;
  }

  </style>

  </head>

  <body>

  <header>
  <h2>Advertiser Landing Simulation</h2>
  </header>

  <div class="container">

    <div class="card">

      <h1>Ad Click Simulation</h1>

      <p>This page simulates a user landing on an advertiser website after clicking an advertisement.</p>

      ${rows}

      <div class="notice">
        rendered by adsense-simulator
      </div>

    </div>

  </div>

  </body>

  </html>
  `;
}
