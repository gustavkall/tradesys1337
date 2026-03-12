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

### INFRA-003 — Migrera till stateful backend
**Prioritet:** MAX
**Beskrivning:** Migrera från filbaserat minneslager (~85%) till Supabase + Vercel + Pinecone (~95-98%). Fullständig buildplan i state/session_handoff.md.
**Fas 1:** Supabase — tabeller (watchlist, portfolio, observations, sessions) + index.html-migration
**Fas 2:** Vercel — API-routes (/api/regime, /api/watchlist, /api/state)
**Fas 3:** Pinecone — embedda session_handoff + decisions, semantisk sökning
**Fas 4:** Boot-sekvens uppgradering (GET /api/state → JSON)
**Beroenden:** Gustav skapar Supabase-projekt och ger URL + nyckel

### INFRA-004 — Fixa update-docs.yml PAT_TOKEN
**Prioritet:** LOW (backlog)
**Beskrivning:** update-docs.yml checkout failar pga saknad/ogiltig PAT_TOKEN secret. Blockar inte annat arbete.

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
| WQ-002 | Regenerera Alpha Vantage API-nyckel | 2026-03-09 | ✅ Ny nyckel inlagd, fundamentals verifierat |
| BUG-007 | POLYGON_KEY i GitHub Secrets fixad | 2026-03-12 | ✅ Uppdaterad + lokal .env skapad |

---

## OBSERVATIONS
*Marknads- och systeminsikter från aktiva sessioner. Läggs till manuellt av Claude vid sessionslut.*

| Datum | Ticker/Ämne | Observation | Källa |
|-------|-------------|-------------|-------|
| 2026-03-08 | NOC | Bipolar score +3, EMA intact. Kandidat vid RISK-ON + VIX <25 | Session |
| 2026-03-08 | GLDD | Stale Polygon 4H-data verifierad. Kontrollera vid nästa scan | Session |
| 2026-03-10 | Polygon API | I:VIX endpoint kräver uppgraderad plan. Stocks Starter räcker för aktier | Session |
| 2026-03-10 | GitHub Actions | update-state + update-docs fungerar. POLYGON_KEY secret har fel värde (BUG-007) | Session |
| 2026-03-12 | BUG-007 | POLYGON_KEY fixad i GitHub Secrets. Verifierad lokalt med fetch-state.js | Session |
