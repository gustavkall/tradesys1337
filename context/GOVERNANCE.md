# TRADESYS CORE GOVERNANCE v1.1
*Based on SignalHub Governance v1.0 — adapted for TRADESYS*

## PURPOSE
This project is a trading analysis system built to remain reliable across sessions despite LLM statelessness.

## CORE ARCHITECTURE
The system shall be treated as:
- LLM (stateless reasoning engine)
- \+ Memory DB
- \+ Retrieval layer
- \+ State engine
- \+ Governance layer

---

## DEFINITIONS

### 1. LLM
The LLM is used for reasoning, planning, analysis, and code generation.
It is stateless and must never be treated as a source of persistent truth.

### 2. Memory DB
Persistent storage for durable knowledge:
- product rules
- design decisions
- work history
- canonical state
- verified outputs

**If knowledge is not persisted, it does not exist.**

### 3. Retrieval Layer
Responsible for fetching the right persisted knowledge into the working context.
No important assumption may be made without retrieval from source-of-truth.

Sources (in order):
- `context/GOVERNANCE.md` — immutable rules
- `context/SYSTEM.md` — trader profile, API config, methodology
- `context/TECH.md` — bugs, architecture, algorithm status
- `context/STATE.json` — current work state

### 4. State Engine
Tracks current operational state:
- what is active
- what is paused
- what is blocked
- what was last completed
- what the next step is

This replaces reliance on chat history.

### 5. Governance Layer
Defines immutable operating rules:
- what counts as truth
- what counts as evidence
- what counts as done
- what is in scope
- what must never be violated

---

## CORE GOVERNANCE RULES

### RULE 1 — STATELESS MODEL
The LLM has no reliable memory between sessions.
Never rely on prior chat context unless explicitly persisted and retrieved.

### RULE 2 — PERSISTED TRUTH ONLY
Persistent truth must live outside the model.
Truth must come from codebase, database, config, or governance documents.

### RULE 3 — SOURCE OF TRUTH HIERARCHY
Priority order:
1. GitHub repo (index.html, context/)
2. Persisted STATE.json
3. Governance docs (GOVERNANCE.md, SYSTEM.md, TECH.md)
4. Deployment/runtime verification (tradesys1337.netlify.app)
5. Chat history

Chat history is **never** source-of-truth for system state.

### RULE 4 — DEPLOYMENT IS REFERENCE, NOT AUTHORITY
The live deployed app may be used to inspect current behavior.
But deployment alone does not define truth.
Truth must map back to repo, state, and governance.

### RULE 5 — NO ASSUMPTION MODE
Before proposing structural changes, inspect:
- current index.html in repo
- current deployed behavior
- STATE.json
- active constraints in TECH.md

Do not assume architecture, naming, or unfinished work.

### RULE 6 — EXPLICIT WORK STATE
At any moment, work must be classified as one of:
- `active`
- `paused`
- `blocked`
- `ready`

There should be at most one active priority item unless explicitly approved.

### RULE 7 — EVIDENCE BEFORE "DONE"
Nothing is "done" because it looks done.
Done requires:
- implementation exists in repo
- behavior is verified
- result is traceable
- STATE.json is updated
- next session can resume without guesswork

### RULE 8 — NO MANUAL TRUTH FABRICATION
Do not invent evidence, state, metrics, or completion status.
If something is unverified, label it `[UNVERIFIED]`.

### RULE 9 — UI DATA INTEGRITY
UI must reflect real underlying state.
No hardcoded demo values in production-like surfaces unless explicitly marked as `[MOCK]`.

### RULE 10 — ROUND-TRIP THINKING
A feature is not complete when code exists.
It is complete when:
`input → logic → state mutation → rendered output`
can be verified end-to-end.

### RULE 11 — AUTOMATE WHAT REPEATS
Any repeated operational task should be moved out of chat memory and into:
- scripts
- state tracking
- generation pipelines
- validation routines

### RULE 12 — DRIFT IS A FAILURE MODE
If code, deployment, state, and docs disagree — **stop and resolve drift before continuing.**

---

## MINIMUM SESSION BOOT
Every new session must establish:
1. What is this system?
2. What is the current source of truth?
3. What is the latest deployed state?
4. What is currently active / paused / blocked / next?
5. What exact task should be continued now?

Boot sequence:
```
web_fetch: https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/GOVERNANCE.md
web_fetch: https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/SYSTEM.md
web_fetch: https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/TECH.md
web_fetch: https://raw.githubusercontent.com/gustavkall/tradesys1337/main/context/STATE.json
```

---

## DEFINITION OF CONTINUITY
Continuity does not mean "remember the old chat".
Continuity means:
- persisted state is intact
- current system can be inspected
- work can resume deterministically
- next action is recoverable without narrative guessing

---

## TRADING-SPECIFIC GOVERNANCE RULES

### TRADE-RULE 1 — EDGE THRESHOLD
Edge-rating under 3/5 = ingen trade. Hårdkodat i getRec().

### TRADE-RULE 2 — MINIMUM RR
RR under 1:2 = ingen trade. Filtreras av buildTradePlan().

### TRADE-RULE 3 — REGIME BLOCK
CHOP / TRANSITION regime = INGEN TRADE. Inga undantag.

### TRADE-RULE 4 — VIX SPIKE BLOCK
VIX daglig rörelse >10% = blockar alla nya BUY-signaler automatiskt.

### TRADE-RULE 5 — DATA OVER VISUAL
Verifiera alltid mot rådata. Visuell tolkning av chart är aldrig tillräcklig.

### TRADE-RULE 6 — STOP BEFORE ENTRY
Stop-nivå måste vara numeriskt definierad INNAN entry tas.