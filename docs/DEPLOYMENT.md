# DEPLOYMENT GUIDE (Render free tier + Groq free tier)

## 1. Prerequisites
- A GitHub repo containing this project.
- A free Groq API key: <https://console.groq.com/keys>.
- A free Render account: <https://render.com>.

## 2. Local check before deploying
```bat
python -m venv venv
venv\Scripts\activate
pip install -r backend\requirements.txt
copy backend\.env.example backend\.env      :: then add GROQ_API_KEY
python -m uvicorn backend.main:app --reload --port 8001
```
Open <http://127.0.0.1:8001> and confirm the **AI status chip** reads **AI: online**.

## 3. Deploy on Render — option A (Blueprint)
1. Push the project to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo.
3. Render reads `render.yaml` and provisions the web service
   (Python **3.11.9** is pinned there, matching the version this build is tested on).
4. When prompted, set the secret env var **`GROQ_API_KEY`**.
5. Click **Apply**. The first build installs `backend/requirements.txt`.

## 4. Deploy on Render — option B (manual Web Service)
| Field | Value |
| --- | --- |
| Environment | Python 3 |
| Build Command | `pip install -r backend/requirements.txt` |
| Start Command | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/health` |

Environment variables:
```
AI_PROVIDER=groq
GROQ_MODEL_PRIMARY=qwen/qwen3.8-27b
GROQ_MODEL_SECONDARY=openai/gpt-oss-120b
ASSIGNED_TOPIC=DBMS (Database Management Systems)
GROQ_API_KEY=<secret>
```

## 5. Free-tier notes
- **Ephemeral disk:** on the free plan the filesystem is reset whenever the
  service sleeps or redeploys, so `history.db` (review history, quiz
  leaderboard) resets. This is fine for a demo.
- **Cold starts:** free services spin down after inactivity; the first request
  may take ~30–60 s.
- **Groq rate limits:** the free tier is rate limited. The app handles this by
  retrying the secondary model and then falling back to offline banks.

## 6. Optional: persist SQLite
Render disks require a paid instance. If you add one (mount path e.g. `/data`),
set:
```
SCHEMAWISE_DB=/data/history.db
```
The app creates the file and tables automatically on startup.

## 7. Renaming the site, and switching models
- The name in the masthead, the browser tab and the Help panel comes from the single
  line in **`project_name.txt`** at the repo root. Edit it, commit, and the redeploy
  shows the new name — no code change. The `PROJECT_NAME` env var overrides the file,
  for renaming without pushing a commit.
- `GET /api/project-name` → `{"name": "..."}` confirms what the running service reports.
- Groq models: `GROQ_MODEL_PRIMARY` (default `qwen/qwen3.8-27b`) and
  `GROQ_MODEL_SECONDARY` (default `openai/gpt-oss-120b`). Qwen 3.8 27B is a *preview*
  model, so keep the secondary on a production model — the app switches over
  automatically on a 429 or a model error.

## 8. Post-deploy verification
- `GET https://<your-app>.onrender.com/api/health` → `{"status":"ok"}`
- `GET https://<your-app>.onrender.com/api/project-name` → `{"name":"SchemaWise AI"}`
- Open the app, run a review, start a 3-question quiz, load exam questions.
- The **AI status chip** should read **AI: online** when the key is valid.
