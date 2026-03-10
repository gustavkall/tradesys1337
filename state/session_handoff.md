# TRADESYS — SESSION HANDOFF
*Skriven: 2026-03-10. Läses automatiskt vid nästa sessionstart.*

---

## VART VI ÄR

Dashboard v32+ stabil på Netlify.
Persistent memory-infrastruktur byggd och verifierad idag.
GitHub Actions (update-state.yml) bekräftat fungerande — SPY/IWM/HYG hämtas dagligen 22:30 CET.
update-docs.yml har PAT_TOKEN-problem som inte är löst — låg prioritet, blockar inte annat arbete.

---

## VAD SOM BYGGDES IDAG

| Vad | Fil | Status |
|-----|-----|--------|
| GitHub Action — marknadsdata | .github/workflows/update-state.yml | ✅ Verifierad live |
| GitHub Action — project_memory | .github/workflows/update-docs.yml | ⚠️ PAT_TOKEN-fel |
| Watchlist sync till repo | state/watchlist.json + Sync-knapp | ✅ Live |
| Observations-sektion | state/work_queue.md | ✅ Live |
| Session handoff i boot | AI_STARTPROMPT.md fil 6 + fråga 6 | ✅ Live |
| DEC-009 — Stateful backend | project_memory/decisions.md | ✅ Dokumenterat |
| White paper v1 + v2 | Externt dokument | ✅ Levererat |
| INFRA-003 buildplan | session_handoff.md | ✅ Dokumenterat nedan |

---

## MARKNADSREGIM VID SESSIONSLUT

| Parameter | Värde | Datum |
|-----------|-------|-------|
| VIX | 23.01 | 2026-03-10 |
| VIX daglig rörelse | -9.80% | |
| SPX | 6,819 | +0.34% |
| SPY | 678.27 | +1.78% |
| IWM | 253.62 | |
| HYG | 80.29 | +0.12% |
| MOVE | 79.75 | -1.87% |
| US10Y | 4.115 | +0.32% |
| Regime | TRANSITION / RISK-OFF LÄTTNAD | |
| Signal | INGEN TRADE — ej konfirmerat RISK-ON | |

---

## HÖGSTA PRIORITET NÄSTA SESSION — INFRA-003

### Syfte
Migrera från filbaserat minneslager (~85% persistent memory) till stateful backend (~95-98%).
Gustav har konton på Supabase, Pinecone och Vercel. Alla är redo att användas.

### Fas 1 — Supabase (börja här)
Gustav skapar projekt manuellt:
- supabase.com → New project → namn: tradesys → region: eu-west-1
- Kopiera SUPABASE_URL och SUPABASE_ANON_KEY från Project Settings → API

Claude Code bygger:
- Fyra tabeller via SQL i Supabase:
  watchlist (id, ticker, bolag, addad timestamp, notering text)
  portfolio (id, ticker, entry numeric, stopp numeric, size numeric, addad timestamp)
  observations (id, datum date, ticker text, observation text, kalla text)
  sessions (id, datum date, summary text, regime text, next_action text)
- Uppdatera index.html: ersätt localStorage WL[] och PF[] med Supabase-anrop
- Lägg till SUPABASE_URL och SUPABASE_ANON_KEY i localStorage (samma mönster som Polygon-nyckel)
- Sync-knappen uppdateras: skriver till Supabase istället för GitHub API

### Fas 2 — Vercel
Gustav importerar repo:
- vercel.com → Import Git Repository → gustavkall/tradesys1337
- Netlify behålls parallellt tills Vercel är verifierad

Claude Code bygger:
- api/regime.js — returnerar current_state.md som JSON
- api/watchlist.js — CRUD mot Supabase
- api/state.js — skriver session handoff automatiskt vid inaktivitet

### Fas 3 — Pinecone
Gustav skapar index:
- pinecone.io → Create index → namn: tradesys-memory → dimensions: 1536

Claude Code bygger:
- scripts/embed-memory.js — embeddar session_handoff.md + decisions.md
- GitHub Action: kör embed-memory.js vid varje push till main
- Boot-sekvensen uppgraderas: Pinecone-query ersätter manuell filhämtning

### Fas 4 — Boot-sekvens uppgradering
Boot går från:
  Fetch 6 statiska filer → Claude läser manuellt
Till:
  GET /api/state → JSON med all kontext
  Pinecone query → semantiskt relaterad historik
  Claude har fullständig kontext utan manuella fetch-kommandon

### Estimerad byggtid
Fas 1: 2-3 timmar
Fas 2: 1 timme
Fas 3: 2-3 timmar
Fas 4: 1 timme
Totalt: ~8-10 timmar (kan delas upp över flera sessioner)

---

## WORK QUEUE STATUS

| ID | Status | Notering |
|----|--------|----------|
| WQ-001 | READY | Verifiera watchlist live — kräver öppen marknad |
| WQ-002 | ✅ DONE | AV-nyckel regenererad och implementerad |
| WQ-003 | READY | Bot auto-scan live-test |
| WQ-004 | READY | Intradag-validering workflow |
| WQ-005 | PAUSAD | NOC — väntar RISK-ON + VIX <25 |
| INFRA-003 | HÖGSTA PRIORITET | Stateful backend — se ovan |
| INFRA-004 | BACKLOG | Fixa update-docs.yml PAT_TOKEN-problem |

---

## NÄSTA SESSION STARTAR MED

1. Fetcha alla 6 boot-filer inklusive denna fil
2. Besvara 6 boot-frågor
3. Gustav skapar Supabase-projekt och ger Claude Code URL + nyckel
4. Starta INFRA-003 Fas 1 — Supabase-tabeller och index.html-migration
