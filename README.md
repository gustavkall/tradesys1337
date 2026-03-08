# TRADESYS

Regelbaserat daytrading-system för amerikansk börs. Single-file HTML-applikation med Polygon.io integration.

**Live dashboard**: https://tradesys1337.netlify.app

---

## FÖR CLAUDE — SESSION BOOT

Kör alltid dessa 4 fetch vid sessionstart:

```
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/GOVERNANCE.md
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/SYSTEM.md
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/TECH.md
https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/STATE.json
```

Besvara sedan MINIMUM SESSION BOOT-frågorna från GOVERNANCE.md.

---

## REPO-STRUKTUR

```
tradesys1337/
├── index.html              ← Dashboard (senaste version)
├── README.md               ← Detta dokument
└── context/
    ├── GOVERNANCE.md       ← Immutable operating rules
    ├── SYSTEM.md           ← Trader-profil, API, metodologi
    ├── TECH.md             ← Buggar, fixes, arkitektur
    └── STATE.json          ← Aktuell work-state
```

---

## DEPLOY

GitHub → Netlify auto-deploy vid varje push till `main`.

Uppdatera dashboard:
1. Ersätt `index.html` i repo
2. Push → Netlify deployas automatiskt (~30 sek)

Uppdatera context-dokument:
1. Redigera relevant fil i `context/`
2. Push → gäller från nästa Claude-session