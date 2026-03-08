# TRADESYS — DECISION LOG
*Kumulativ historik över arkitektur- och designbeslut med motivering. Läggs till, aldrig raderas.*

---

## BESLUT-FORMAT
```
### DEC-XXX — Titel
**Datum:** YYYY-MM-DD
**Beslut:** Vad beslutades
**Alternativ övervägda:** Vad som övervägdes men valdes bort
**Motivering:** Varför detta beslut
**Påverkan:** Vad som förändrades
```

---

### DEC-001 — Single-file HTML arkitektur
**Datum:** 2026-02-19
**Beslut:** TRADESYS byggs som en enda HTML-fil med inline JS och CSS.
**Alternativ övervägda:** React-app med npm, separata JS/CSS-filer
**Motivering:** Maximal portabilitet — fungerar lokalt, via Netlify, eller direkt från filsystem utan byggsteg. Trader kan öppna filen direkt i webbläsaren utan server.
**Påverkan:** All kod i index.html. Kräver disciplinerad str_replace-redigering.

---

### DEC-002 — Polygon Stocks Starter ($29/mån)
**Datum:** 2026-02-19
**Beslut:** Polygon.io Stocks Starter som primär datakälla.
**Alternativ övervägda:** Yahoo Finance (gratis, instabil), Alpaca (kräver mäklarkonto), Tiingo
**Motivering:** Unlimited API calls, strukturerade endpoints, 5 år historik, WebSockets vid behov.
**Påverkan:** 15-min delay på alla priser. Snap() returnerar null på helger.

---

### DEC-003 — Bipolär scoring -5 till +5
**Datum:** 2026-02-19
**Beslut:** Setup-score är bipolär: positiva faktorer adderar, negativa subtraherar.
**Alternativ övervägda:** Enkel 0-5 skala, procentbaserad scoring
**Motivering:** Bipolär scoring tvingar fram explicit positivt/negativt — en medioker setup kan inte dölja sina negativa faktorer bakom höga positiva.
**Påverkan:** calcSetupScore() med +/-1 faktorer. Edge-threshold på 3.

---

### DEC-004 — ADX underestimering accepterad
**Datum:** 2026-03-06
**Beslut:** ADX-avvikelsen (7-14 enheter under TradingView) accepteras utan fix.
**Alternativ övervägda:** Öka bars till 500+ för bättre konvergens, använda enklare EMA-ADX
**Motivering:** DI+/DI- riktning (det kritiska för signalgenerering) är korrekt. 500 bars orsakar rate-limiting på Polygon. Avvikelsen är dokumenterad och känd.
**Påverkan:** BUG-001 markerad som "känd begränsning", inte aktiv bugg.

---

### DEC-005 — Batch-size 3, 400ms delay
**Datum:** 2026-03-08
**Beslut:** Watchlist-loader kör 3 tickers per batch med 400ms delay.
**Alternativ övervägda:** 8 tickers parallellt (ursprunglig), 1 ticker i taget (för långsamt)
**Motivering:** Polygon Stocks Starter har unlimited calls men throttlar vid hög concurrency. 8 parallella tickers med 500 bars = för många simultana requests.
**Påverkan:** Laddningstid ökar proportionellt med antal tickers. Acceptabelt.

---

### DEC-006 — GitHub + Netlify som deploy-pipeline
**Datum:** 2026-03-08
**Beslut:** GitHub repo (gustavkall/tradesys1337) → Netlify auto-deploy på main-push.
**Alternativ övervägda:** Netlify Drop (ingen versionskontroll), Vercel, GitHub Pages
**Motivering:** GitHub ger versionskontroll + Claude kan pusha via API. Netlify auto-deployas utan konfiguration. Kombinationen ger full CI/CD utan komplexitet.
**Påverkan:** Varje index.html-uppdatering kräver GitHub-push. Netlify deployas inom 30 sek.

---

### DEC-007 — Repo ska vara publikt
**Datum:** 2026-03-08
**Beslut:** tradesys1337-repot ska vara publikt (inte privat).
**Alternativ övervägda:** Privat med GitHub token i Claude Project Instructions
**Motivering:** Repot innehåller inga känsliga data (API-nycklar lagras i localStorage, aldrig i kod). Publikt repo möjliggör `raw.githubusercontent.com`-fetch utan auth — kritiskt för retrieval-lagret i Claude-sessioner.
**Påverkan:** Retrieval-lagret fungerar utan token. Claude kan fetcha context-filer direkt.

---

### DEC-008 — Repo-struktur: governance/state/project_memory
**Datum:** 2026-03-08
**Beslut:** Migrerade från `context/` (4 filer) till separerade mappar med tydlig semantik.
**Alternativ övervägda:** Behålla context/ (funktionellt men flackt)
**Motivering:** Tydligare separation: governance (oföränderligt), state (uppdateras varje session), project_memory (kumulativt). Lättare för Claude att veta vilken fil som ska uppdateras när.
**Påverkan:** Boot-sekvensen fetchar nu 5 filer (governance + 2 state + 2 memory) istället för 4.
