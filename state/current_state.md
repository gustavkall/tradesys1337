# TRADESYS — CURRENT STATE
*Uppdateras av Claude vid varje sessionslut. Source of truth för operationellt läge.*

---

## SYSTEMSTATUS
| Parameter | Värde |
|-----------|-------|
| Datum | 2026-03-09 |
| Dashboard version | v32+ |
| Repo | github.com/gustavkall/tradesys1337 |
| Live URL | https://tradesys1337.netlify.app |
| Branch | main |
| Status | ready |

---

## AKTIVT ARBETE
**Status:** `ready` — ingen aktiv uppgift pågår

**Senast slutfört:**
- BUG-002: ind.d1.ema50 → ind.ema50 (TypeError fix, watchlist blank)
- BUG-003: Kolumnmismatch 23→24 kolumner, colspan fix
- BUG-004: Rate-limit fix, batch 8→3, 400ms delay
- Repo-struktur: GitHub + Netlify setup, context/ filer pushade
- Repo-migration: context/ → governance/state/project_memory/ (denna session)
- WQ-002: Alpha Vantage API-nyckel regenererad, verifierad 2026-03-09

---

## BLOCKERAT
Inget blockerat.

---

## PAUSAT
- OMXS30/VSTOXX expansion (låg prioritet, väntar på stabil US-baseline)
- Bot auto-scan live-validering (kräver öppen marknad)

---

## MARKNADSREGIM (SENAST KÄNT)
| Parameter | Värde | Datum |
|-----------|-------|-------|
| Regime | RISK-OFF | 2026-03-08 |
| VIX | 35.67 | 2026-03-08 |
| VIX daglig rörelse | +13.7% SPIKE | 2026-03-08 |
| SPY | -1.31% | 2026-03-08 |
| HYG | -0.49% | 2026-03-08 |
| Signal | INGEN TRADE | 2026-03-08 |

---

## API-STATUS
| Tjänst | Status | Notering |
|--------|--------|----------|
| Polygon Stocks Starter | ✅ Aktiv | Unlimited calls, 15-min delay |
| Alpha Vantage | ✅ Aktiv | Nyckel regenererad 2026-03-09 |
| Anthropic Chart API | ✅ Konfigurerad | sk-ant-... i orange fält i UI |

---

## NÄSTA SESSION STARTAR MED
1. Fetcha governance/system_rules.md, state/current_state.md, state/work_queue.md
2. Fetcha project_memory/architecture.md, project_memory/decisions.md
3. Besvara MINIMUM SESSION BOOT-frågorna
4. Fortsätt med work_queue.md → nästa item
