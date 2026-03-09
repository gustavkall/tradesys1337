# TRADESYS

Trading dashboard — multi-timeframe watchlist, SW/DT bot, fundamentals, chart-analys.

**Live:** https://tradesys1337.netlify.app

---

## SESSION BOOT — för varje ny Claude-chatt

Kör dessa 6 fetch automatiskt i sessionstart:

```
1. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/governance/system_rules.md
2. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/state/current_state.md
3. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/state/work_queue.md
4. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/project_memory/architecture.md
5. https://raw.githubusercontent.com/gustavkall/tradesys1337/main/project_memory/decisions.md
```

---

## ARBETSFLÖDE

Claude Code är installerat. För kodändringar i index.html — 
använd Claude Code i terminalen (cd ~/tradesys1337 && claude).
Denna chatt används för strategi, analys och beslut.

---

## KRAV

- **CORS Unblocked** (Chrome-extension) — måste vara aktiv
- **Polygon.io API-nyckel** — Stocks Starter ($29/mån)
- **Alpha Vantage API-nyckel** — gratis (25 req/dag)
- **Anthropic API-nyckel** — för chart-analys (sk-ant-...)

---

## REPOSTRUKTUR

```
tradesys1337/
├── index.html                    ← Dashboard (ALLT i en fil)
├── governance/
│   └── system_rules.md           ← Arbetsregler, governance
├── state/
│   ├── current_state.md          ← Nuvarande systemstate
│   └── work_queue.md             ← Uppgifter och prioritering
└── project_memory/
    ├── architecture.md           ← Teknisk arkitektur
    └── decisions.md              ← Beslutslogg
```

---

## STACK

- Vanilla HTML/CSS/JS — noll dependencies, noll build-steg
- Polygon.io REST API — OHLCV, snapshots, indices
- Alpha Vantage API — fundamentaldata (P/E, EPS, earnings)
- Anthropic Claude API — chart-analys via vision
- Netlify — statisk hosting, auto-deploy från GitHub main
