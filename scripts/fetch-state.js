// TODO: Claude Code frågar manuellt om current_state.md vid sessionslut.
// Fix: session_handoff-workflow ska trigga update-state automatiskt
// vid push av session_handoff.md — ingen manuell bekräftelse ska krävas.
//
// TODO: Lägg till VIX och MOVE när endpoint är verifierat (I:VIX kräver uppgraderad plan)

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

async function prev(ticker) {
  const d = await get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${KEY}`);
  if (!d.results || !d.results.length) return null;
  return d.results[0];
}

function f(n, d = 2) { return n != null ? n.toFixed(d) : '—'; }
function fPct(n) { return n != null ? (n >= 0 ? '+' : '') + f(n) + '%' : '—'; }

async function main() {
  const [spy, iwm, hyg] = await Promise.all([
    prev('SPY'),
    prev('IWM'),
    prev('HYG'),
  ]);

  if (!spy) { console.error('Could not fetch SPY data'); process.exit(1); }

  const today = new Date().toISOString().split('T')[0];

  const spyChg = (spy.c - spy.o) / spy.o * 100;
  const iwmChg = iwm ? (iwm.c - iwm.o) / iwm.o * 100 : null;
  const hygChg = hyg ? (hyg.c - hyg.o) / hyg.o * 100 : null;

  const newSection = [
    '## MARKNADSREGIM (SENAST KÄNT)',
    '| Parameter | Värde | Datum |',
    '|-----------|-------|-------|',
    `| SPY close | ${f(spy.c)} | ${today} |`,
    `| SPY daglig | ${fPct(spyChg)} | ${today} |`,
    `| IWM close | ${iwm ? f(iwm.c) : '—'} | ${today} |`,
    `| IWM daglig | ${fPct(iwmChg)} | ${today} |`,
    `| HYG close | ${hyg ? f(hyg.c) : '—'} | ${today} |`,
    `| HYG daglig | ${fPct(hygChg)} | ${today} |`,
    `| VIX | — (kräver plan-uppgradering) | ${today} |`,
    `| Signal | — | ${today} |`,
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
  console.log(`Updated: SPY ${f(spy.c)} (${fPct(spyChg)}) | IWM ${iwm ? f(iwm.c) : '—'} | HYG ${hyg ? f(hyg.c) : '—'} | ${today}`);
}

main().catch(e => { console.error(e); process.exit(1); });
