// TODO: Claude Code frågar manuellt om current_state.md vid sessionslut.
// Fix: session_handoff-workflow ska trigga update-state automatiskt
// vid push av session_handoff.md — ingen manuell bekräftelse ska krävas.

const fs = require('fs');
const https = require('https');

const POLYGON = process.env.POLYGON_KEY;
const AV = process.env.ALPHA_VANTAGE;
if (!POLYGON) { console.error('POLYGON_KEY not set'); process.exit(1); }
if (!AV) { console.error('ALPHA_VANTAGE not set'); process.exit(1); }

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

// --- Polygon ---

async function snapshot(ticker) {
  const d = await get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON}`);
  return d.ticker;
}

async function vixSnapshot() {
  const today = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
  const d = await get(`https://api.polygon.io/v2/aggs/ticker/I:VIX/range/1/day/${from}/${today}?adjusted=true&sort=desc&limit=2&apiKey=${POLYGON}`);
  if (!d.results || d.results.length < 2) return null;
  const latest = d.results[0];
  const prev = d.results[1];
  return { close: latest.c, change: (latest.c - prev.c) / prev.c * 100 };
}

function pctChange(snap) {
  if (!snap || !snap.todaysChangePerc) return null;
  return snap.todaysChangePerc;
}

// --- Alpha Vantage ---

async function avGet(params) {
  const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return get(`https://www.alphavantage.co/query?${qs}&apikey=${AV}`);
}

async function avOverview(ticker) {
  try {
    const d = await avGet({ function: 'OVERVIEW', symbol: ticker });
    if (!d.Symbol) return null;
    return {
      pe: d.PERatio !== 'None' ? parseFloat(d.PERatio) : null,
      eps: d.EPS !== 'None' ? parseFloat(d.EPS) : null,
      rev: d.RevenueTTM !== 'None' ? parseFloat(d.RevenueTTM) : null,
      mktCap: d.MarketCapitalization !== 'None' ? parseFloat(d.MarketCapitalization) : null,
      sector: d.Sector || null,
    };
  } catch { return null; }
}

async function avTreasuryYield(maturity) {
  try {
    const d = await avGet({ function: 'TREASURY_YIELD', interval: 'daily', maturity });
    if (!d.data || !d.data.length) return null;
    return parseFloat(d.data[0].value);
  } catch { return null; }
}

async function avSectorPerf() {
  try {
    const d = await avGet({ function: 'SECTOR' });
    const daily = d['Rank B: 1 Day Performance'];
    if (!daily) return null;
    return Object.entries(daily).map(([sector, pct]) => ({
      sector,
      pct: parseFloat(pct),
    })).sort((a, b) => b.pct - a.pct);
  } catch { return null; }
}

// --- Logic ---

function regime(vix, vixChg, spyChg) {
  if (vixChg > 10) return 'RISK-OFF';
  if (vix > 30) return 'RISK-OFF';
  if (vix > 25) return 'CAUTION';
  if (vix < 18 && spyChg > 0) return 'RISK-ON';
  return 'NEUTRAL';
}

function signal(reg, vixChg) {
  if (reg === 'RISK-OFF') return 'INGEN TRADE';
  if (vixChg > 10) return 'INGEN TRADE';
  if (reg === 'CAUTION') return 'REDUCERAD SIZE';
  return 'NORMAL';
}

function f(n, d = 2) { return n != null ? n.toFixed(d) : '—'; }
function fPct(n) { return n != null ? (n >= 0 ? '+' : '') + f(n) + '%' : '—'; }
function fBn(n) { return n != null ? (n / 1e9).toFixed(1) + 'B' : '—'; }

// Top watchlist tickers for fundamentals (high priority / large positions)
const FUND_TICKERS = ['NVDA', 'AVGO', 'AMZN', 'AAPL', 'MSFT', 'AMD', 'ASML', 'TSM', 'LLY', 'PLTR'];

async function main() {
  // --- Polygon: market data ---
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

  // --- Alpha Vantage: yields, sectors, fundamentals ---
  // AV free tier: 25 req/day, so we batch carefully
  const [us2y, us10y] = await Promise.all([
    avTreasuryYield('2year'),
    avTreasuryYield('10year'),
  ]);

  const sectors = await avSectorPerf();

  // Fetch fundamentals sequentially (AV rate limit: 5/min on free tier)
  const fundamentals = [];
  for (const ticker of FUND_TICKERS) {
    const ov = await avOverview(ticker);
    if (ov) fundamentals.push({ ticker, ...ov });
    // 12s delay to stay within 5 req/min
    if (ticker !== FUND_TICKERS[FUND_TICKERS.length - 1]) {
      await new Promise(r => setTimeout(r, 12000));
    }
  }

  // --- Build sections ---

  const yieldSpread = (us10y != null && us2y != null) ? us10y - us2y : null;
  const yieldStatus = yieldSpread != null
    ? (yieldSpread < 0 ? 'INVERTERAD (' + f(yieldSpread, 2) + ')' : 'Normal (' + f(yieldSpread, 2) + ')')
    : '—';

  const regimSection = [
    '## MARKNADSREGIM (SENAST KÄNT)',
    '| Parameter | Värde | Datum |',
    '|-----------|-------|-------|',
    `| Regime | ${reg} | ${today} |`,
    `| VIX | ${f(vix.close)} | ${today} |`,
    `| VIX daglig rörelse | ${vix.change >= 0 ? '+' : ''}${f(vix.change, 1)}%${vixSpike} | ${today} |`,
    `| SPY | ${fPct(spyChg)} | ${today} |`,
    `| IWM | ${fPct(pctChange(iwm))} | ${today} |`,
    `| HYG | ${fPct(pctChange(hyg))} | ${today} |`,
    `| US 10Y | ${us10y != null ? f(us10y) + '%' : '—'} | ${today} |`,
    `| US 2Y | ${us2y != null ? f(us2y) + '%' : '—'} | ${today} |`,
    `| Yield spread 10Y-2Y | ${yieldStatus} | ${today} |`,
    `| Signal | ${sig} | ${today} |`,
  ].join('\n');

  // Sector performance (top 3 + bottom 3)
  let sectorSection = '';
  if (sectors && sectors.length > 0) {
    const top3 = sectors.slice(0, 3);
    const bot3 = sectors.slice(-3).reverse();
    sectorSection = [
      '',
      '### Sektorprestation (daglig)',
      '| Sektor | Förändring |',
      '|--------|-----------|',
      ...top3.map(s => `| ${s.sector} | ${fPct(s.pct)} |`),
      '| ... | ... |',
      ...bot3.map(s => `| ${s.sector} | ${fPct(s.pct)} |`),
    ].join('\n');
  }

  // Fundamentals
  let fundSection = '';
  if (fundamentals.length > 0) {
    fundSection = [
      '',
      '### Fundamentals (top watchlist)',
      '| Ticker | P/E | EPS | Mkt Cap | Sektor |',
      '|--------|-----|-----|---------|--------|',
      ...fundamentals.map(f => `| ${f.ticker} | ${f.pe != null ? f.pe.toFixed(1) : '—'} | ${f.eps != null ? f.eps.toFixed(2) : '—'} | ${fBn(f.mktCap)} | ${f.sector || '—'} |`),
    ].join('\n');
  }

  const fullSection = regimSection + sectorSection + fundSection;

  // --- Update file ---

  const file = 'state/current_state.md';
  const content = fs.readFileSync(file, 'utf8');

  const start = content.indexOf('## MARKNADSREGIM (SENAST KÄNT)');
  const end = content.indexOf('\n---', start);

  if (start === -1 || end === -1) {
    console.error('Could not find MARKNADSREGIM section');
    process.exit(1);
  }

  const updated = content.slice(0, start) + fullSection + content.slice(end);
  fs.writeFileSync(file, updated);
  console.log(`Updated: ${reg} | VIX ${f(vix.close)} | Spread ${yieldStatus} | ${fundamentals.length} fundamentals | ${today}`);
}

main().catch(e => { console.error(e); process.exit(1); });
