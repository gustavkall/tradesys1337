# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is TRADESYS

A rule-based US stock daytrading dashboard. Single-file HTML application (`index.html`, ~2700 lines) with inline JS/CSS. Zero build dependencies. Deployed on Netlify via GitHub auto-deploy.

Live: https://tradesys1337.netlify.app

## Development Commands

```bash
# Local dev server
./serve.sh                    # or: python3 -m http.server 8080

# JS syntax check (MUST run before any deploy)
node -e "const fs=require('fs'),vm=require('vm'); const h=fs.readFileSync('index.html','utf8'); new vm.Script(h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>')));"

# Deploy: push to main → Netlify auto-deploys (~30s)
# Deploy once per session after local verification, not per-change

# GitHub Actions (automated):
# - update-state.yml: Cron 22:30 CET Mon-Fri, fetches SPY/IWM/HYG market data
# - update-docs.yml: Auto-logs changes to project_memory/decisions.md on push
```

## Architecture

### Single-file dashboard (`index.html`)
All application code lives in one HTML file. No bundler, no framework, no npm.

### Data flow
- **Polygon.io** — OHLCV bars, snapshots, VIX (API key in localStorage `tradesys_key`)
- **Alpha Vantage** — Fundamentals/earnings (localStorage `tradesys_avkey`, 25 req/day, 23h cache)
- **Anthropic Claude** — Vision-based chart analysis (localStorage `tradesys_antkey`)

### Key functions in index.html
| Function | Purpose |
|----------|---------|
| `getBars(t, mult, span, limit, days)` | OHLCV from Polygon (400ms batch delay) |
| `calcEMA/calcRSI/calcADXFull/calcPearsonR` | Technical indicators |
| `calcSetupScore()` | Bipolar -5 to +5 trade rating |
| `buildSignal()` | Trade signal generation |
| `buildTradePlan()` | Stop/T1/T2/RR calculation (min RR 1:2, min T1 2%) |
| `calcDynamicStop()` | ATR-based stops (DT vs SW mode) |
| `buildWLRow()` | Renders one watchlist row (24 columns) |
| `loadWatchlist()` | Batch loader (3 tickers/batch, 400ms delay) |
| `botRun()` | Bot scan (SW-bot daily or DT-bot intraday) |
| `caAnalyze()` | Chart analysis via Claude vision API |
| `snap(t)` | Current price snapshot |

### UI tabs
WATCHLIST, MIN PORTFOLJ, SEKTORER, LOGG & EDGE, SW-BOT, CHART-ANALYS, DEBUG

### Persistence
- `WL[]`, `PF[]`, `TRADE_LOG[]` → localStorage
- `REGIME`, `SPY_BARS[]`, `BOT_PENDING[]`, `AV_CACHE{}` → runtime only

## Governance & Repo Structure

```
governance/system_rules.md    — Immutable rules (change only via decisions.md)
state/current_state.md        — Operational state, updated end-of-session
state/work_queue.md           — Prioritized tasks (max 1 ACTIVE)
state/session_handoff.md      — Last session context + next steps
project_memory/architecture.md — Stable architecture docs
project_memory/decisions.md   — Cumulative decision log
scripts/fetch-state.js        — Node.js market data fetcher (used by GH Actions)
```

## Critical Code Rules

1. **JS syntax check before deploy** — Always run the `node vm.Script` check above
2. **Minimal edits** — Change only specific lines, never rewrite entire file without explicit request
3. **24-column table** — Watchlist/portfolio table has exactly 24 columns. Count them after any table change
4. **EMA50 path** — Use `ind.ema50`, NOT `ind.d1.ema50` (known pitfall)
5. **ADX known limitation** — ADX underestimates by 7-14 units vs TradingView (Wilder's RMA convergence)

## Session Boot Protocol (MANDATORY — do this automatically on session start)

Before doing anything else, fetch and read these 6 files:
1. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/governance/system_rules.md
2. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/state/current_state.md
3. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/state/work_queue.md
4. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/project_memory/architecture.md
5. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/project_memory/decisions.md
6. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/state/session_handoff.md

Then determine: current system state, active/blocked work, and the exact next task.

## Commit Conventions

```
feat:  ny funktion
fix:   buggfix
state: session handoff / state-uppdatering
infra: GitHub Actions, deploy-config
docs:  dokumentation
```

## Deploy Rule

One push per session, after local verification via `./serve.sh`. No per-change deploys during active development.

## Session Handoff Protocol (MANDATORY)

At the end of every session, **without being asked**, perform the following:

1. **Update `state/session_handoff.md`** — Write what was done this session, current system state, and explicit next steps for the following session.
2. **Update `state/current_state.md`** — Set today's date, update system status, active/paused/blocked items, and any changed API or deploy state.
3. **Update `state/work_queue.md`** — Mark completed items as `done`, move newly started items to `active`, and reprioritize if needed.
4. **Commit and push state**:
   ```bash
   git add state/ && git commit -m "state: session handoff YYYY-MM-DD" && git push
   ```

This is not optional. Every session ends with a state handoff commit. No exceptions.
