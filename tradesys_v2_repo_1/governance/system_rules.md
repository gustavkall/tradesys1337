# TRADESYS SYSTEM RULES v1.1
*Immutable governance layer. Ändras endast via explicit beslut med motivering i decisions.md.*

---

## SYSTEMARKITEKTUR
```
LLM (stateless reasoning engine)
+ Memory Layer      → project_memory/
+ Retrieval Layer   → raw.githubusercontent.com URLs
+ State Engine      → state/
+ Governance Layer  → governance/   ← denna fil
+ Verification Layer → JS syntax-check + kolumnräkning
+ Execution Layer   → GitHub push → Netlify auto-deploy
```

---

## CORE RULES

### RULE 1 — STATELESS MODEL
LLM har inget minne mellan sessioner. Lita aldrig på chat-historik som source of truth.

### RULE 2 — PERSISTED TRUTH ONLY
Sanning lever i repo. Om det inte är committat existerar det inte.

### RULE 3 — SOURCE OF TRUTH HIERARKI
1. GitHub repo (governance/, state/, project_memory/, index.html)
2. Netlify deployment (tradesys1337.netlify.app) — för beteendeverifiering
3. Chat history — aldrig ensam source of truth

### RULE 4 — NO ASSUMPTION MODE
Innan strukturella ändringar: läs aktuell index.html, state/current_state.md och project_memory/architecture.md.
Anta ingenting om arkitektur, namngivning eller oavslutat arbete.

### RULE 5 — EXPLICIT WORK STATE
Allt arbete klassificeras alltid som: `active` | `paused` | `blocked` | `ready`
Max ett aktivt prioritetsitem utan explicit godkännande.

### RULE 6 — EVIDENCE BEFORE DONE
"Klart" kräver: implementation i repo + beteende verifierat + state uppdaterat.
Inget är klart för att det "ser klart ut".

### RULE 7 — DRIFT IS A FAILURE MODE
Om repo, deployment och state-filer inte stämmer överens → stoppa och lös drift innan fortsättning.

### RULE 8 — NO FABRICATION
Uppfinn inte bevis, state eller completion-status. Overifierat märks [UNVERIFIED].

### RULE 9 — ROUND-TRIP VERIFICATION
Feature är klar när: `input → logic → state mutation → rendered output` kan verifieras end-to-end.

### RULE 10 — AUTOMATE REPEATING TASKS
Repetitiva uppgifter ska automatiseras — inte leva i chat-minne.

---

## KOD-REGLER (TRADESYS-SPECIFIKA)

### KOD-REGEL 1 — JS SYNTAX FÖRE DEPLOY
```javascript
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('index.html','utf8');
const js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
new vm.Script(js); // Kastar om syntax-fel
```
Kör alltid detta innan cp till outputs.

### KOD-REGEL 2 — MINIMAL str_replace
Ändra bara den specifika raden. Skriv aldrig om hela filen utan explicit begäran.

### KOD-REGEL 3 — KOLUMNRÄKNING VID TABELLÄNDRING
```python
cols = ['TICKER','BOLAG','PRIS','CHG%','GAP','TF 1D/4H/1H','VWAP',
        'EMA10','EMA20','EMA50','RSI','ADX','REL.VOL','RS5','PEARSON R',
        'STOPP','ENTRY','T1','RR','SIGNAL','ANALYS','NOTERING','📊','']
assert len(cols) == 24
```

### KOD-REGEL 4 — EMA50 PLACERING
EMA50 lagras på `ind.ema50` — INTE `ind.d1.ema50`. Detta är en känd fallgrop.

---

## TRADE-REGLER (ALDRIG BRYTS)

| Regel | Villkor | Konsekvens |
|-------|---------|------------|
| EDGE | Rating <3/5 | Ingen trade |
| RR | Under 1:2 | Ingen trade |
| REGIME CHOP | SPX <0.3%, VIX flat | Ingen trade |
| REGIME TRANSITION | Signaler motstrider | Ingen trade |
| VIX SPIKE | >10% daglig rörelse | Blockar alla BUY |
| STOP | Ej numeriskt definierat | Ingen trade |
| DATA | Visuell tolkning | Verifiera mot rådata |

---

## DEPLOY-PIPELINE
```
1. Redigera index.html lokalt (Claude i /home/claude/)
2. JS syntax-check (node vm.Script)
3. cp till /mnt/user-data/outputs/
4. Du laddar ned + pushar till GitHub
5. Netlify auto-deployas (~30 sek)
6. Claude uppdaterar state/ och project_memory/ i repo
```
