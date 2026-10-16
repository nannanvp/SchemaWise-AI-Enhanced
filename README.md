# SchemaWise AI — DBMS Learning Suite

An AI-assisted **Database Schema Reviewer** for DBMS students, extended into a
small learning suite: build schemas visually, review them with rule-based +
AI feedback, take graded quizzes, and practise competitive-exam questions.

Built with **FastAPI + SQLite + vanilla HTML/CSS/JS**. AI is powered by
**Groq** (primary: `qwen/qwen3.8-27b`, fallback: `openai/gpt-oss-120b`). Everything
still works offline thanks to built-in question banks.

> This repository is the **Enhanced** build — published as
> [`nannanvp/SchemaWise-AI-Enhanced`](https://github.com/nannanvp/SchemaWise-AI-Enhanced) —
> plus a fifth section: **V. Learn, Download & Help**, with eight working lessons, six
> in-browser exports and a troubleshooting FAQ. Sections I–IV are unchanged.

---

## ✨ Features

### Original
- SQL input with 5 sample schemas
- Schema validation (syntax-level parse of `CREATE TABLE`)
- Primary-key / foreign-key / naming / constraint / index checks
- Schema score (0–100) and pass/warn/suggestion findings
- Table + relationship visualisation
- Animated "review steps" progress
- AI + built-in explanation panel
- Review history (SQLite) and downloadable text report
- **Redesigned "Codex" UI** — an academic, ink-on-paper presentation: a numbered
  table-of-contents sidebar (I. Schema Review, II. Table Designer, III. Quiz,
  IV. Exam Questions, V. Learn, Download & Help), a document header, serif-led
  typography and hairline rules; light theme by default (a quiet dark "reading
  lamp" variant is available) and an animated score ring. The sidebar becomes a
  drawer on narrow screens.
  Design system: [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md).

### 1. 🧱 Table Designer (add tables visually)
- Add any number of tables from the UI (no SQL needed)
- Per-column: name, data type, **PK / NOT NULL / UNIQUE** flags
- Foreign-key picker that lists columns of already-designed tables
- Live SQL preview, copy-to-clipboard, and **Send to Review Editor**
- Designed tables are saved in `localStorage`

### 2. 🎯 Quiz
- Asks for **name**, **topic**, **difficulty** (Easy / Medium / Hard) and **number of questions**
- Generates questions on the assigned topic (AI when available, curated bank otherwise)
- Shows **one question at a time**
- Correct option → **"You have answered correctly"** + explanation
- Wrong option → **"Yet to choose the correct answer"** + explanation, retry allowed
- On submit → **scoreboard with the player's name, score, percentage, letter grade and per-question review**
- Persisted **leaderboard** (top scores in SQLite)

### 3. 🎓 Competitive Exam Questions (GATE / UGC NET)
- Curated DBMS questions from GATE / GATE-IT / UGC NET papers
- Each question shows a bracketed **citation tag**, e.g. **`[GATE CS 2021]`**,
  `[UGC NET 2019]`
- Pick an option to self-test — the correct answer is **never** highlighted while
  the solution is hidden
- **Show Solution** toggle reveals the **Answer & Solution** and marks the correct
  option (plus your own pick, if it was wrong)
- Filter by exam and topic; optionally **Generate with AI** for extra questions

### 4. 📚 Learn, Download & Help (section V)
- **Learn** — eight self-contained working lessons: primary keys and entity
  integrity, foreign keys and referential integrity, NOT NULL/UNIQUE rules,
  normalisation 1NF → BCNF, why many-to-many needs a junction table, naming
  conventions, indexes and foreign-key speed, and how to read a review report.
- Every lesson ends with a runnable example and an **Open in Reviewer** button that
  loads the example into section I, runs the audit and shows the result.
- **Download** — six exports, all generated in the browser (nothing is uploaded):
  the review report as **Markdown** or **JSON**, the designer's schema as **`.sql`**,
  the quiz score sheet as **CSV** (attempt + top ten), the loaded exam questions as
  **CSV**, and the eight lessons as a printable **Markdown** study sheet. An export
  stays disabled until there is something behind it.
- The score sheet distinguishes **"correct on first try"** from
  **"correct after retry"**, per question.
- **Help** — a four-step quick start and a ruled FAQ covering the Groq key, model
  failover, what the score measures, invalid foreign keys, ephemeral databases on
  Render, and printing the page as a handout.

---

## 🚀 Run locally (Windows)

```bat
git clone https://github.com/nannanvp/SchemaWise-AI-Enhanced.git
cd SchemaWise-AI-Enhanced
START_PROJECT.bat
```

Step by step:

1. Install Python 3.10+.
2. Double-click **`START_PROJECT.bat`** (creates a virtual environment, installs
   dependencies and starts the server).
3. Open **http://127.0.0.1:8001**.

> This build listens on **8001** so it can run beside the original SchemaWise build,
> which keeps **8000**.

### Manual start
```bat
python -m venv venv
venv\Scripts\activate
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --port 8001
```

---

## 🔑 Enabling the AI (Groq free tier)

The app runs without AI (it falls back to the built-in banks). To turn on the
online AI:

1. Get a free key at <https://console.groq.com/keys>.
2. Copy `backend\.env.example` to `backend\.env`.
3. Set:
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GROQ_MODEL_PRIMARY=qwen/qwen3.8-27b
GROQ_MODEL_SECONDARY=openai/gpt-oss-120b
```
4. Restart the server. The **AI status chip** should read **AI: online**.

If Groq returns `429` (rate limit) or the primary model fails, the app
automatically retries with the secondary model, then falls back to the offline
banks — it never crashes.

The primary model is **Qwen 3.8 27B** (`qwen/qwen3.8-27b` — 131K context, JSON
mode, tunable reasoning). It is a Groq *preview* model, so
`openai/gpt-oss-120b` is kept as the automatic fallback; either can be swapped
with the two environment variables above.

---

## ☁️ Deploy on Render (free tier)

A `render.yaml` blueprint is included. Either:

**A. Blueprint** — New → Blueprint → connect this repo. Render reads `render.yaml`.

**B. Manual Web Service**
- Runtime: **Python**
- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `AI_PROVIDER=groq`, `GROQ_API_KEY=<your key>`,
  `GROQ_MODEL_PRIMARY=qwen/qwen3.8-27b`,
  `GROQ_MODEL_SECONDARY=openai/gpt-oss-120b`

> **Note:** Render's free tier has an ephemeral disk, so SQLite history and the
> leaderboard reset when the service sleeps/redeploys. Set `SCHEMAWISE_DB` to a
> mounted disk path if you add a paid disk. See `docs/DEPLOYMENT.md`.

---

## 🏷️ Renaming the site (`project_name.txt`)

The name shown in the browser tab, the masthead wordmark and the Help panel comes
from **`project_name.txt`** in the repository root:

```text
SchemaWise AI
```

Edit that one line, save, and reload the page — the server re-reads the file
whenever it changes, so no restart and no code change is required. When hosted on
Render, commit the change and the redeploy applies it.

Precedence: the `PROJECT_NAME` environment variable wins when it is set, then
`project_name.txt`, then the built-in default `SchemaWise AI`. Use the env var
only when you want to rename the site without pushing a commit.

`GET /api/project-name` returns `{"name": "..."}` for scripts and health checks.

---

## 🔌 API reference

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/review` | Review `CREATE TABLE` SQL, save history |
| `GET`  | `/api/history` | List recent reviews |
| `GET`  | `/api/history/{id}` | Fetch one review |
| `POST` | `/api/ai-explain` | AI tutor explanation of a review |
| `GET`  | `/api/status` | AI availability |
| `GET`  | `/api/project-name` | The site name (`project_name.txt`) |
| `GET`  | `/api/config` | App config, name, model chain, exam filters, topic |
| `POST` | `/api/quiz/generate` | Build a quiz (`topic`, `difficulty`, `count`) |
| `POST` | `/api/quiz/submit` | Save a score to the leaderboard |
| `GET`  | `/api/quiz/leaderboard` | Top scores |
| `GET`  | `/api/exam/questions` | Curated exam questions (filter by exam/topic) |
| `POST` | `/api/exam/generate` | AI-generate exam-style questions |
| `GET`  | `/api/health` | Health probe |

---

## 📁 Project structure

```
SchemaWise-AI-Enhanced-v2/
├─ backend/
│  ├─ main.py           # FastAPI app + all endpoints
│  ├─ ai_provider.py    # Groq/Ollama client with failover + JSON parsing
│  ├─ quiz_bank.py      # curated quiz questions (easy/medium/hard)
│  ├─ exam_bank.py      # curated GATE / UGC NET questions with tags
│  ├─ requirements.txt
│  └─ .env.example
├─ frontend/
│  ├─ index.html        # Codex shell (sidebar: Review / Designer / Quiz / Exam / Learn)
│  ├─ style.css
│  └─ app.js
├─ docs/                # user manual, test cases, deployment, AI usage log
├─ project_name.txt     # site name shown in the UI (edit this one line)
├─ render.yaml          # Render blueprint
├─ START_PROJECT.bat    # one-click local start
└─ README.md
```

---

## 🩺 Troubleshooting

| Symptom | Fix |
| --- | --- |
| Header shows **AI: offline** | Set `GROQ_API_KEY` in `backend/.env` and restart. |
| Quiz says "Offline question bank" | Same as above — AI is unavailable, bank used instead. |
| `No module named 'fastapi'` | Activate the venv and run `pip install -r backend/requirements.txt`. |
| Port 8001 in use | `python -m uvicorn backend.main:app --port 8010`. |
| Renamed the site but the old name persists | A `PROJECT_NAME` environment variable is set and wins over `project_name.txt` — clear it, or edit it. |
| Renamed the site but the deploy still shows the old name | Commit `project_name.txt` and redeploy; the running service only sees committed files. |
| History/leaderboard empty on Render | Expected on the free tier (ephemeral disk) — see `docs/DEPLOYMENT.md`. |
