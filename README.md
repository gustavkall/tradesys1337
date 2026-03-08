# TRADESYS
Regelbaserat daytrading-system för amerikansk börs.

**Live dashboard:** https://tradesys1337.netlify.app  
**Repo:** https://github.com/gustavkall/tradesys1337

---

## FÖR CLAUDE — SESSION BOOT

Klistra in `AI_STARTPROMPT.md` i Claude Project Instructions.  
Claude fetchar automatiskt rätt filer och är briefad på 10 sekunder.

Boot-sekvens (5 filer):
```
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/governance/system_rules.md
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/state/current_state.md
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/state/work_queue.md
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/project_memory/architecture.md
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/project_memory/decisions.md
```

---

## REPO-STRUKTUR

```
tradesys1337/
├── index.html                ← Dashboard (senaste version, deployas till Netlify)
├── README.md                 ← Detta dokument
├── AI_STARTPROMPT.md         ← Klistras in i Claude Project Instructions
├── governance/
│   └── system_rules.md       ← Immutable operating rules (ändras sällan)
├── state/
│   ├── current_state.md      ← Operationellt läge (uppdateras varje session)
│   ├── work_queue.md         ← Prioriterad uppgiftslista
│   └── session_handoff.md    ← Handoff-notering till nästa session
└── project_memory/
    ├── architecture.md       ← Teknisk arkitektur (uppdateras vid strukturförändringar)
    └── decisions.md          ← Beslutlogg med motiveringar (kumulativ, aldrig raderas)
```

### Filernas syfte
| Fil | Uppdateras | Av vem |
|-----|-----------|--------|
| governance/system_rules.md | Vid regeländring | Explicit beslut |
| state/current_state.md | Varje session | Claude vid sessionslut |
| state/work_queue.md | Varje session | Claude vid sessionslut |
| state/session_handoff.md | Varje session | Claude vid sessionslut |
| project_memory/architecture.md | Vid strukturförändring | Claude |
| project_memory/decisions.md | Vid beslut | Claude (additivt) |
| index.html | Vid dashboard-uppdatering | Claude → du pushar |

---

## DEPLOY-PIPELINE

```
Claude redigerar index.html
→ JS syntax-verifieras (node vm.Script)
→ Du laddar ned från Claude outputs
→ Du pushar till GitHub main
→ Netlify auto-deployas (~30 sek)
→ Claude uppdaterar state/ och pushar
```

---

## API-TJÄNSTER

| Tjänst | Tier | Syfte |
|--------|------|-------|
| Polygon.io | Stocks Starter ($29/mån) | OHLCV, snapshots, indices |
| Alpha Vantage | Free (25 req/dag) | Fundamentals: P/E, EPS, earnings |
| Anthropic | API | Chart-analys via Vision |
| TradingView | Premium | Manuell chartanalys (ej API-integrerat) |

**API-nycklar lagras i browser localStorage — aldrig i repot.**
