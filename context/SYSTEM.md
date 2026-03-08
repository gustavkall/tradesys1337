# TRADESYS SYSTEM.md
*Trader-profil, API-tjänster, metodologi — läses vid session boot*

## TRADER-PROFIL
| Parameter | Värde |
|-----------|-------|
| Kapital per trade | 50 000 – 100 000 SEK |
| Antal trades/dag | 1–2 max |
| Courtage | 0,069% (min 69 kr) |
| Plattform | TradingView Premium |
| Indikatorer | EMA 10/20/50/100/200, RSI, ADX, RelVol, VWAP, Pearson's R |
| Timeframes | 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W |
| Stil | Daytrading — varje session fristående, ingen övernattning |
| Mentalitet | Follow the hype i Risk-On. Riskavert vid makrovarningar. |

---

## API-TJÄNSTER

### Polygon.io — Stocks Starter ($29/mån)
- Unlimited API calls
- 15-minuters fördröjd data
- 5 års historisk data, 100% market coverage
- Minute Aggregates, Snapshots, WebSockets tillgängliga
- **API-nyckel: lagras i dashboard localStorage — aldrig i kod eller prompt**
- Nyckel-fält: "POLYGON-NYCKEL" i dashboard header

### Alpha Vantage — Free Tier
- 25 requests/dag
- Endpoints: OVERVIEW, EARNINGS
- Används för: P/E, EPS, revenue growth, earnings surprises, analyst targets
- Cache: 23h TTL (AV_CACHE objekt i dashboard)
- **API-nyckel: lagras i localStorage, fältet "ALPHA VANTAGE:" i UI**
- ⚠️ Regenerera nyckel — gammal nyckel APUJC1KAVER6QMW7 exponerades i chat

### TradingView Premium
- Används parallellt av tradern för manuell chartanalys
- Inte API-integrerat i TRADESYS
- Bekräftar setup visuellt innan trade

### Anthropic API (Chart Analysis)
- Används i "CHART-ANALYS"-fliken i dashboard
- Kräver sk-ant-... nyckel (separat orange fält i UI)
- Headers: anthropic-version + anthropic-dangerous-direct-browser-access: true

---

## DASHBOARD-ARKITEKTUR

### Format
Single-file HTML + inline JS + inline CSS.
Inga externa dependencies utöver Polygon API.
Körs lokalt i webbläsaren eller via Netlify.

### Kärnmoduler
| Funktion | Syfte |
|----------|-------|
| `getBars(t, mult, span, limit, days)` | Hämtar OHLCV från Polygon |
| `calcEMA(bars, period)` | Exponentiellt glidande medelvärde |
| `calcADXFull(bars, period)` | ADX + DI+ + DI- (Wilder's RMA) |
| `calcRSI(bars, period)` | RSI 14 |
| `calcPearsonR(bars, period)` | Linjäritet i trend |
| `scoreTF(bars, label)` | Poängsätter timeframe 0-3 |
| `getInd(ticker)` | Master-fetcher: kör alla indikatorer parallellt |
| `calcSetupScore(...)` | Bipolar scoring -5 till +5 |
| `buildSignal(...)` | Genererar signal med reasons |
| `buildTradePlan(ind, stop)` | Stop/T1/T2/RR beräkning |
| `calcDynamicStop(bars, price, atr, mode)` | ATR-baserat dynamiskt stopp |
| `buildWLRow(item, ind, idx)` | Renderar watchlist-rad (24 kolumner) |
| `buildPFRow(item, ind, idx)` | Renderar portföljrad (24 kolumner) |
| `loadWatchlist()` | Batch-loader, 3 tickers/batch, 400ms delay |

### State-variabler (localStorage + runtime)
| Variabel | Innehåll |
|----------|----------|
| `REGIME` | RISK-ON / RISK-OFF / ROTATION / CHOP / TRANSITION |
| `WL[]` | Watchlist: [{t, n, b, up, stop}] |
| `PF[]` | Portfölj med fundamentalHold-flag |
| `SPY_BARS[]` | SPY dagliga bars för RS5-beräkning |
| `BOT_PENDING[]` | BUY-signals som väntar 30s bekräftelse |
| `AV_CACHE{}` | Alpha Vantage cache med 23h TTL |

### Kolumnstruktur Watchlist (24 kolumner — KRITISK)
`TICKER | BOLAG | PRIS | CHG% | GAP | TF 1D/4H/1H | VWAP | EMA10 | EMA20 | EMA50 | RSI | ADX | REL.VOL | RS5 | PEARSON R | STOPP | ENTRY | T1 | RR | SIGNAL | ANALYS | NOTERING | 📊 | [del]`

**EMA50 ligger på `ind.ema50` — INTE `ind.d1.ema50`**

---

## INTERMARKET-HIERARKI
Analysera alltid i denna ordning:
1. SPX struktur (4h + 1h)
2. VIX nivå och riktning
3. HYG/LQD — kreditflöde
4. US10Y + US02Y — räntekurva
5. IWM/SPX — small cap vs large cap
6. SOXX/SPX, XLF/SPX — sektorrotation
7. DXY — dollarns påverkan

## MARKNADSREGIMER
| Regim | Definition | Tillåtet |
|-------|-----------|----------|
| RISK-ON | SPX upp, VIX ned, HYG stark | Trend Continuation (A), Pullback HL (B) |
| RISK-OFF | VIX stiger, HYG svag | Inga långa positioner |
| ROTATION | Sektor-switch, mixed signals | Starkaste sektor, halverad size |
| CHOP | SPX <0.3%, VIX flat | INGEN TRADE |
| TRANSITION | Regimbyte pågår | INGEN TRADE |

## WATCHLIST
- Sektorer: SOXX, XLE, XLI, XLF, XLB, XLU, XLK
- Semi: MU, STX, WDC, ASML, NVDA, AMD
- Aktiva i dashboard: ORN, AVAV, AGX, STX, NVDA

## SETUP-TYPER
- **A — Trend Continuation**: Köp HL i etablerad trend. Entry vid EMA10/20 reclaim på 15m med volym.
- **B — Pullback HL**: Entry vid VWAP reclaim eller EMA-stöd med bekräftande volym.
- **C — Range/Mean Reversion**: Kräver Edge-rating 4+.

## PRINCIPER SOM ALDRIG BRYTS
- Köp alltid HL i trend, VWAP reclaim i rätt regim
- Köp aldrig mitt i range, extended, mot kreditflöde, utan numerisk stop
- Edge under 3 = ingen trade
- Data över visuell tolkning — verifiera mot rådata, inte chart-känsla

---

## ARBETSPROCESS FÖR CLAUDE
1. Läs aktuell fil: `view /home/claude/trading_dashboard.html`
2. Identifiera exakt rad med grep/bash
3. Minimala ändringar med `str_replace`
4. Verifiera JS: `node -e "const vm=require('vm'); new vm.Script(js)"`
5. Räkna kolumner explicit vid tabelländringar
6. Deploya: `cp` till outputs + `present_files`

**ALDRIG** skriva om hela filen utan explicit begäran.
**ALDRIG** anta att fix är klar utan syntax-verifiering.

---

## KOMMUNIKATION
- Svenska, professionell trading-terminologi
- Raka besked — ingen sugar-coating
- Strukturerat format: PRE-MARKET / INTRADAG / POST-MARKET
- Om edge saknas: "INGEN TRADE IDAG" med motivering