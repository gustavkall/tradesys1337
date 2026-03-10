const fs = require('fs');
const https = require('https');

const KEY = process.env.POLYGON_KEY;
if (!KEY) { console.error('POLYGON_KEY not set'); process.exit(1); }

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

async function snapshot(ticker) {
  const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${KEY}`;
  const d = await get(url);
  return d.ticker;
}

async function vixSnapshot() {
  const today = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
  const url = `https://api.polygon.io/v2/aggs/ticker/I:VIX/range/1/day/${from}/${today}?adjusted=true&sort=desc&limit=2&apiKey=${KEY}`;
  const d = await get(url);
  if (!d.results || d.results.length < 2) return null;
  const latest = d.results[0];
  const prev = d.results[1];
  const change = ((latest.c - prev.c) / prev.c * 100);
  return { close: latest.c, change };
}

function pctChange(snap) {
  if (!snap || !snap.todaysChange || !snap.prevDay) return null;
  return (snap.todaysChangePerc);
}

function regime(vix, vixChg, spyChg) {
  if (vixChg > 10) return 'RISK-OFF';
  if (vix > 30) return 'RISK-OFF';
  if (vix > 25) return 'CAUTION';
  if (vix < 18 && spyChg > 0) return 'RISK-ON';
  if (vix < 25) return 'NEUTRAL';
  return 'NEUTRAL';
}

function signal(reg, vixChg) {
  if (reg === 'RISK-OFF') return 'INGEN TRADE';
  if (vixChg > 10) return 'INGEN TRADE';
  if (reg === 'CAUTION') return 'REDUCERAD SIZE';
  return 'NORMAL';
}

function f(n, d = 2) {
  return n != null ? n.toFixed(d) : '—';
}

async function main() {
  const [vix, spy, iwm, hyg] = await Promise.all([
    vixSnapshot(),
    snapshot('SPY'),
    snapshot('IWM'),
    snapshot('HYG'),
  ]);

  if (!vix) { console.error('Could not fetch VIX data'); process.exit(1); }

  const today = new Date().toISOString().split('T')[0];
  const spyChg = pctChange(spy);
  const reg = regime(vix.close, vix.change, spyChg);
  const vixSpike = Math.abs(vix.change) > 10 ? ' SPIKE' : '';
  const sig = signal(reg, vix.change);

  const newSection = [
    '## MARKNADSREGIM (SENAST KÄNT)',
    '| Parameter | Värde | Datum |',
    '|-----------|-------|-------|',
    `| Regime | ${reg} | ${today} |`,
    `| VIX | ${f(vix.close)} | ${today} |`,
    `| VIX daglig rörelse | ${vix.change >= 0 ? '+' : ''}${f(vix.change, 1)}%${vixSpike} | ${today} |`,
    `| SPY | ${spyChg != null ? (spyChg >= 0 ? '+' : '') + f(spyChg) + '%' : '—'} | ${today} |`,
    `| HYG | ${pctChange(hyg) != null ? (pctChange(hyg) >= 0 ? '+' : '') + f(pctChange(hyg)) + '%' : '—'} | ${today} |`,
    `| Signal | ${sig} | ${today} |`,
  ].join('\n');

  const file = 'state/current_state.md';
  const content = fs.readFileSync(file, 'utf8');

  const start = content.indexOf('## MARKNADSREGIM (SENAST KÄNT)');
  const end = content.indexOf('\n---', start);

  if (start === -1 || end === -1) {
    console.error('Could not find MARKNADSREGIM section');
    process.exit(1);
  }

  const updated = content.slice(0, start) + newSection + content.slice(end);
  fs.writeFileSync(file, updated);
  console.log(`Updated market regime: ${reg} | VIX ${f(vix.close)} | ${today}`);
}

main().catch(e => { console.error(e); process.exit(1); });
