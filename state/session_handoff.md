# TRADESYS — SESSION HANDOFF
*Fylls i av Claude vid varje sessionslut. Nästa session läser detta för omedelbar orientering.*

---

## SENASTE SESSION
**Datum:** 2026-03-08
**Vad gjordes:**
1. Fixade BUG-002: `ind.d1.ema50` → `ind.ema50` i buildWLRow (watchlist var blank efter rad 1)
2. Fixade BUG-003: Kolumnmismatch, lade till 📊-knapp i buildWLRow, thead 23→24 kolumner
3. Fixade BUG-004: Reducerade bars 500→200/120, batch 8→3, lade till 400ms delay
4. Satte upp GitHub repo (gustavkall/tradesys1337) + Netlify deploy
5. Skapade komplett repo-struktur med governance/state/project_memory/

**Vad som INTE är verifierat:**
- BUG-002/003 i live-miljö (marknad stängd, söndag)
- Bot auto-scan i live-handel

**Kritisk information för nästa session:**
- Repot var privat → retrieval fungerade inte → **gör repot publikt innan nästa session**
- Alpha Vantage-nyckel måste regenereras (exponerades i chat)
- Dashboard version: v32+ i index.html

---

## NÄSTA SESSION — BÖRJA HÄR
1. Session boot (5 fetch-anrop per AI_STARTPROMPT.md)
2. Kontrollera att repot är publikt (raw.githubusercontent.com ska svara 200)
3. Fortsätt med WQ-001 (verifiera watchlist live) om marknad öppen
4. Annars: WQ-002 (regenerera AV-nyckel)

---

## ÖPPNA FRÅGOR
- Ska Netlify-databasen användas för STATE.json istället för GitHub? (beslut: nej, GitHub är enklare)
- Ska repot vara publikt eller privat med token? (rekommendation: publikt, inga känsliga data i repo)
