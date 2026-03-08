# TRADESYS — ARCHITECTURE
*Stabilt arkitektur-dokument. Uppdateras vid strukturella beslut, inte varje session.*

---

## SYSTEMÖVERSIKT
TRADESYS är ett regelbaserat daytrading-verktyg för amerikansk börs.

**Format:** Single-file HTML (index.html) — inline JS + inline CSS, inga externa dependencies utöver Polygon API.
**Hosting:** Netlify (auto-deploy från GitHub main-branch)
**Data:** Polygon.io Stocks Starter — unlimited calls, 15-min delay

---

## REPO-STRUKTUR
```
tradesys1337/
├── index.html                    ← Dashboard (alltid senaste version)
├── README.md                     ← Kort beskrivning + boot-instruktioner
├── AI_STARTPROMPT.md             ← Klistras in i Claude Project Instructions
├── governance/
│   └── system_rules.md           ← Immutable operating rules
├── state/
│   ├── current_state.md          ← Operationellt läge (uppdateras varje session)
│   ├── work_queue.md             ← Prioriterad uppgiftslista
│   └── session_handoff.md        ← Handoff till nästa session
└── project_memory/
    ├── architecture.md           ← Denna fil (stabil)
    └── decisions.md              ← Beslutlogg med motiveringar
```

---

## DASHBOARD-ARKITEKTUR

### Kärnmoduler
| Funktion | Syfte | Kritisk notering |
|----------|-------|-----------------|
| `getBars(t, mult, span, limit, days)` | OHLCV från Polygon | 200/200/120 bars, batch 3, 400ms delay |
| `calcEMA(bars, period)` | EMA beräkning | Returnerar null om bars < period |
| `calcADXFull(bars, period)` | ADX + DI+ + DI- | Wilder's RMA, underestimerar med 7-14 enheter |
| `calcRSI(bars, period)` | RSI 14 | Verifierad korrekt mot TradingView CSV |
| `calcPearsonR(bars, period)` | Linjäritet 50 bars | >0.85=stark, <0.6=choppy |
| `scoreTF(bars, label)` | Poäng per TF 0-3 | Används för bipolar total score |
| `getInd(ticker)` | Master-fetcher | Kör alla indikatorer parallellt |
| `calcSetupScore(...)` | Bipolar -5 till +5 | Faktorer: EMA, DI, RSI, RelVol, RS5, Pearson |
| `buildSignal(...)` | Signal + reasons | Inkluderar WATCH-banner vid rätt regim |
| `buildTradePlan(ind, stop)` | Stop/T1/T2/RR | Minimum RR 1:2, minimum T1 2% |
| `calcDynamicStop(bars, price, atr, mode)` | ATR-baserat stopp | DT vs SW mode |
| `buildWLRow(item, ind, idx)` | Watchlist-rad | **24 kolumner — se nedan** |
| `buildPFRow(item, ind, idx)` | Portföljrad | **24 kolumner** |
| `loadWatchlist()` | Batch-loader | 3 tickers/batch, 400ms delay |

### KRITISK: Kolumnstruktur (24 kolumner)
```
1  TICKER
2  BOLAG
3  PRIS
4  CHG%
5  GAP
6  TF 1D/4H/1H
7  VWAP
8  EMA10
9  EMA20
10 EMA50          ← ind.ema50 (INTE ind.d1.ema50)
11 RSI
12 ADX
13 REL.VOL
14 RS5
15 PEARSON R
16 STOPP
17 ENTRY
18 T1
19 RR
20 SIGNAL
21 ANALYS
22 NOTERING
23 📊 (AV fundamentals)
24 [del-knapp]
```

### State-variabler
| Variabel | Typ | Persist |
|----------|-----|---------|
| `REGIME` | string | Runtime |
| `WL[]` | array | localStorage |
| `PF[]` | array | localStorage |
| `SPY_BARS[]` | array | Runtime (refresh) |
| `BOT_PENDING[]` | array | Runtime |
| `AV_CACHE{}` | object | Runtime (23h TTL) |

---

## API-INTEGRATION

### Polygon.io
- Base URL: `https://api.polygon.io`
- Auth: `?apiKey=KEY` query param
- Nyckel: localStorage key `tradesys_key`
- Endpoints: `/v2/aggs/ticker/`, `/v2/snapshot/`, `/v2/aggs/ticker/I:VIX/`

### Alpha Vantage
- Base URL: `https://www.alphavantage.co/query`
- Auth: `&apikey=KEY`
- Nyckel: localStorage key `tradesys_avkey`
- Endpoints: `OVERVIEW`, `EARNINGS`
- Cache: `AV_CACHE` objekt, 23h TTL

### Anthropic (Chart Analysis)
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: claude-sonnet-4-20250514
- Headers: `anthropic-version: 2023-06-01`, `anthropic-dangerous-direct-browser-access: true`
- Nyckel: localStorage key `tradesys_antkey` (sk-ant-...)

---

## ALGORITM-STATUS
| Indikator | Precision | Verifierad |
|-----------|-----------|------------|
| EMA10/20/50 | Exakt | ✅ CSV-verifierad |
| RSI (14) | Exakt | ✅ CSV-verifierad |
| DI+/DI- riktning | Exakt | ✅ CSV-verifierad |
| ADX nivå | -7 till -14 enheter | ⚠️ Wilder's RMA konvergens |
| Pearson's R | Exakt | ✅ |
| Structure | Korrekt | ✅ EMA20-slope + pivot |

---

## INTRADAG-VALIDERING LOG
| Datum | Ticker | Signal | Outcome | Match |
|-------|--------|--------|---------|-------|
| 2026-03-06 | STX | AVSTA | -2.08% | ✅ |
| 2026-03-06 | WDC | AVSTA | -2.94% | ✅ |
| 2026-03-06 | MU | AVSTA | -3.57% | ✅ |
