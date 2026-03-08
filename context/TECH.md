# TRADESYS TECH.md
*Buggar, fixes, algoritmstatus, arkitekturbeslut — uppdateras varje session*

## DASHBOARD VERSION
- **Aktiv version**: v32+ (index.html i detta repo)
- **Live URL**: https://tradesys1337.netlify.app
- **Bar-fetch**: 200 bars 1D, 200 bars 4H, 120 bars 1H
- **Batch-size**: 3 tickers/batch, 400ms delay

---

## BEKRÄFTADE BUGGAR & STATUS

### BUG-001 — ADX Systematisk Underskattning
- **Symptom**: ADX 7-14 enheter under TradingView-värde
- **Rotorsak**: Wilder's RMA behöver 500+ bars för full konvergens. Med 200 bars startar EMA från bar 14 och konvergerar aldrig fullt.
- **Fix**: Ökat bar-fetch till 200 (kompromiss konvergens/API-last)
- **Status**: KÄND BEGRÄNSNING — DI+/DI- riktning (det kritiska) är korrekt oavsett
- **Impact**: ADX-nivå underestimerad med 7-14 enheter. Acceptabelt för signalgenerering.

### BUG-002 — ind.d1.ema50 TypeError (FIXAD)
- **Symptom**: Watchlist renderade bara första tickern, resten blank
- **Rotorsak**: EMA50 sparas på `ind.ema50` (inte `ind.d1.ema50`). buildWLRow refererade `ind.d1.ema50` → TypeError → tbody kraschade efter rad 1.
- **Fix**: Ändrat alla `ind.d1.ema50` → `ind.ema50` i buildWLRow
- **Status**: ✅ FIXAD i v32+

### BUG-003 — Kolumnantal Mismatch (FIXAD)
- **Symptom**: Tabell kraschade, alignment fel
- **Rotorsak**: thead hade 23 kolumner, buildWLRow hade 23 (ingen 📊-knapp). colspan-värden var 22.
- **Fix**: Lagt till 📊-knapp + fund-row i buildWLRow. Thead → 24 kolumner. colspan → 24.
- **Kritisk regel**: EMA50 är kolumn 10 i watchlist-tabellen. Kolumnordning får ALDRIG ändras utan att uppdatera BÅDE thead och buildWLRow.
- **Status**: ✅ FIXAD i v32+

### BUG-004 — Rate Limiting / "---" i datarader (FÖRBÄTTRAD)
- **Symptom**: AVAV, STX, NVDA visade --- i alla kolumner
- **Rotorsak**: getBars 500 bars × 3 TF × 8 tickers parallellt → throttling
- **Fix**: 200/200/120 bars. Batch 8→3. 400ms delay.
- **Status**: ⚠️ FÖRBÄTTRAD — Polygon Stocks Starter har unlimited calls men throttlar vid hög concurrency. Helgdagar ger null från snap() (Polygon returnerar tom day-data på stängd marknad).

### BUG-005 — Structure Algorithm Divergens (EJ BUGG)
- **Symptom**: Python CSV-verifiering visade annan klassifikation än JS
- **Rotorsak**: Python använde split-halves. JS `calcStructure()` använder EMA20-slope (50 bars) + 15-bars pivot detection.
- **Fix**: Inte en bugg — JS är korrektare. Python-skriptet var felkalibrerat.
- **Status**: ✅ VERIFIERAD KORREKT

### BUG-006 — Chart Analysis "Failed to fetch" (FIXAD)
- **Symptom**: Fel vid API-anrop i chart-analys-fliken
- **Rotorsak**: Saknade Anthropic API-nyckel-fält och CORS-headers
- **Fix**: Orange API-nyckel-box (sk-ant-...). Headers: `anthropic-version` + `anthropic-dangerous-direct-browser-access: true`
- **Status**: ✅ FIXAD

---

## ALGORITM-VERIFIERING
*Verifierad mot TradingView CSV-export, 8 tickers × 3 TF, mars 2026*

| Indikator | Status | Kommentar |
|-----------|--------|-----------|
| EMA10, EMA20, EMA50 | ✅ KORREKT | Noll deviation mot TV CSV |
| RSI (14) | ✅ KORREKT | Noll deviation |
| DI+ / DI- riktning | ✅ KORREKT | Det kritiska för signalgenerering |
| ADX (14) nivå | ⚠️ UNDERESTIMERAT | 7-14 under, Wilder's RMA konvergens |
| Pearson's R | ✅ KORREKT | 50-bars beräkning |
| Structure (trend/pullback) | ✅ KORREKT | EMA20-slope + pivot, bättre än split-halves |
| RelVol | ✅ KORREKT | 20-dagars genomsnittsvolym |

---

## FEATURES

### Implementerade
- **Bot Auto-Scan**: Toggle "🤖 BOT AUTO". SELL=auto, BUY=30s bekräftelse. BOT_PENDING[] queue.
- **VIX Spike Banner**: Sticky banner när VIX >10% daglig rörelse. Röd=spike upp (blockar BUY), Grön=spike ned.
- **Fundamental Hold (🔒)**: F.HOLD per portföljposition. Pausar auto-stop/auto-SELL. T1 aktiv. Hard floor: 5% under stop → exit ändå.
- **Alpha Vantage Fundamentals**: 📊-knapp per rad. OVERVIEW+EARNINGS. 23h cache. P/E, EPS, earnings surprises, analyst target.
- **Chart Analysis**: Anthropic Vision API. Orange nyckel-box. Korrekt CORS-headers.
- **Dynamic Stop**: calcDynamicStop() med ATR-bas.
- **Pearson's R**: 50-bars linjäritet. >0.85=stark trend, <0.6=choppy.

### Pending / Nästa steg
- [ ] Verifiera GLDD 4H live-data (stale Polygon data identifierat tidigare)
- [ ] Testa bot auto-scan i live-marknadsförhållanden
- [ ] NOC identifierad som starkaste kandidat vid regimskifte (bipolar +3)
- [ ] Intradag-validering workflow etablera (5m/15m screenshot 15-20 min efter öppning)
- [ ] Regenerera Alpha Vantage API-nyckel
- [ ] Expandera till OMXS30/VSTOXX för europeisk coverage

---

## KRITISKA TEKNISKA REGLER

### JS-Validering (OBLIGATORISK före deploy)
```javascript
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('trading_dashboard.html','utf8');
const js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
new vm.Script(js); // Kastar om syntax-fel
```

### Kolumnräkning (VID VARJE TABELLÄNDRING)
```python
cols = ['TICKER','BOLAG','PRIS','CHG%','GAP','TF 1D/4H/1H','VWAP',
        'EMA10','EMA20','EMA50','RSI','ADX','REL.VOL','RS5','PEARSON R',
        'STOPP','ENTRY','T1','RR','SIGNAL','ANALYS','NOTERING','📊','']
print(len(cols))  # Ska vara 24
```

### str_replace — Alltid Minimalt
- Ändra BARA den specifika raden
- Kopiera omgivande kontext för att säkerställa unikhet
- Verifiera syntax efter varje ändring

---

## INTRADAG-VALIDERING LOG
*Datum: Regime → Signal → Outcome*

| Datum | Ticker | Signal | Regime | Outcome | Match |
|-------|--------|--------|--------|---------|-------|
| 2026-03-06 | STX | AVSTA | RISK-OFF | -2.08% ✅ | Korrekt |
| 2026-03-06 | WDC | AVSTA | RISK-OFF | -2.94% ✅ | Korrekt |
| 2026-03-06 | MU | AVSTA | RISK-OFF | -3.57% ✅ | Korrekt |