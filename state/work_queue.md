# TRADESYS — WORK QUEUE
*Prioriterad lista. Uppdateras av Claude vid sessionslut. Max ett ACTIVE item.*

---

## ACTIVE
*(inget aktivt)*

---

## READY — PRIORITETSORDNING

### WQ-001 — Verifiera watchlist live efter kolumnfix
**Prioritet:** HÖG
**Beskrivning:** Bekräfta att BUG-002 och BUG-003 är lösta i live-miljö. Alla tickers ska visa data (inte ---).
**Acceptanskriterier:**
- Alla watchlist-tickers laddar med korrekt data
- EMA50-kolumn visar värden (inte ---)
- Inga TypeError i browser console
**Beroenden:** Öppen marknad (US, måndag–fredag 15:30–22:00 CET)

### WQ-002 — Regenerera Alpha Vantage API-nyckel
**Prioritet:** HÖG (säkerhet)
**Beskrivning:** Gammal nyckel APUJC1KAVER6QMW7 exponerades i chat. Måste bytas.
**Steg:** alphavantage.co → API Key → Regenerate → uppdatera i dashboard localStorage
**Acceptanskriterier:** Fundamentals-📊-knapp fungerar med ny nyckel

### WQ-003 — Testa bot auto-scan live
**Prioritet:** MEDIUM
**Beskrivning:** BOT AUTO-toggle testad i sandbox men ej i live-marknadsförhållanden.
**Acceptanskriterier:** SELL-signal triggas korrekt, BUY-bekräftelsekort visas 30s

### WQ-004 — Intradag-validering workflow
**Prioritet:** MEDIUM
**Beskrivning:** Etablera rutinen: 5m/15m screenshot 15-20 min efter öppning → Claude bekräftar/avfärdar entry.
**Format:** [DT] TICKER — Entry X.XX — Stop X.XX — T1 X.XX — RR X.Xx

### WQ-005 — NOC som kandidat vid regimskifte
**Prioritet:** LOW (regime-beroende)
**Beskrivning:** NOC (Northrop Grumman) har bipolar score +3, EMA intact. Bevaka vid RISK-ON.
**Trigger:** Regime skiftar till RISK-ON + VIX under 25

### WQ-006 — GLDD 4H live-data verifiering
**Prioritet:** LOW
**Beskrivning:** GLDD visade stale Polygon data vid tidigare session. Verifiera att 4H bars laddas korrekt.

### WQ-007 — OMXS30/VSTOXX expansion
**Prioritet:** LOW (framtida)
**Beskrivning:** Expandera metodologi till europeisk börs. OMXS30, VSTOXX, Atlas Copco, Saab.
**Beroenden:** Stabil US-baseline etablerad, Polygon stöder europeiska index

---

## COMPLETED

| ID | Uppgift | Datum | Outcome |
|----|---------|-------|---------|
| BUG-001 | ADX konvergens-analys | 2026-03-06 | Känd begränsning dokumenterad |
| BUG-002 | ind.d1.ema50 TypeError | 2026-03-08 | ✅ Fixad |
| BUG-003 | Kolumnmismatch 23→24 | 2026-03-08 | ✅ Fixad |
| BUG-004 | Rate-limit batch-fix | 2026-03-08 | ✅ Förbättrad |
| BUG-006 | Chart Analysis fetch error | 2026-03-07 | ✅ Fixad |
| INFRA-001 | GitHub + Netlify setup | 2026-03-08 | ✅ Klar |
| INFRA-002 | Repo-migration context→v2 | 2026-03-08 | ✅ Klar |
