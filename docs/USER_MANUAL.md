# USER MANUAL

## Getting started

1. Run `START_PROJECT.bat`.
2. Open <http://127.0.0.1:8000>.
3. Switch workspaces from the numbered **table-of-contents sidebar** on the
   left: **I. Schema Review**, **II. Table Designer**, **III. Quiz**, **IV. Exam
   Questions**. The document header above the content shows the active
   workspace's title and subtitle.
4. The global controls stay in the document header — the **AI status chip**
   (online / offline), the **theme control** (light is the default theme, and a
   quiet dark "reading lamp" variant is also available), **History** and
   **Download Report**.
5. On screens narrower than about 900px the sidebar becomes a slide-in drawer —
   use the hamburger button to open it; choosing a workspace closes it.

---

## Schema Review

The Schema Review workspace pairs the SQL editor with an output area holding the
**score ring**, four **metric tiles** and the review results.

1. Paste `CREATE TABLE` SQL into the editor, or click **Sample 1–5** (each sample
   also fills a matching schema name).
2. Optionally type a **Schema Name**.
3. Click **Review Schema** — the six review steps advance while skeleton
   placeholders fill the output area.
4. Read the results:
   - the **score ring** (0–100) and tiles for **tables, errors, warnings** and
     **suggestions**;
   - the table diagram and its relationships, with **PK** badges on primary-key
     columns;
   - findings labelled by severity — errors, warnings, suggestions and passed
     checks — each with a suggested fix where one is available;
   - the explanation panel with its **Built-in AI Tutor / Online AI Tutor** badge.
5. Use **History** to reload an earlier review; **Download Report** to save a
   `.txt`.

---

## Table Designer

The Table Designer pairs a table-builder canvas on the left with a dock on the
right holding the **Designed Tables** stack and the **Generated SQL** preview.

1. On the canvas, enter a **table name** (e.g. `student`).
2. Fill each column row:
   - **Column** name and **Type** (`INT`, `VARCHAR(100)`, `DATE`, …).
   - Tick **PK** (primary key), **NN** (NOT NULL), **UQ** (UNIQUE). Ticking PK
     automatically ticks NN.
   - Choose a **foreign key** from the picker to link to an existing table's
     column.
3. Click **Add Column** for more columns; the remove button on a row deletes a
   column.
4. Click **Add Table** — the table appears in **Designed Tables** and the
   **Generated SQL** preview updates automatically.
5. Repeat for more tables. Foreign-key pickers list every column you have added.
6. Click **Send to Review Editor** to load the generated SQL into the Schema
   Review editor and switch to that workspace, then **Review Schema**. Use
   **Copy SQL** or **Clear All** as needed.

> Designed tables persist in the browser, so a refresh keeps your work.

---

## Quiz

The Quiz stage is centred: a progress bar above the current question, option
tiles below it and the **Leaderboard** in a side rail.

1. Enter your **name** and choose a **Topic** (defaults to the assigned DBMS
   topic; a suggestion list is provided).
2. Pick a **Difficulty**: Easy / Medium / Hard.
3. Enter the **Number of questions** (1–20).
4. Click **Start Quiz**.
5. Questions appear one at a time:
   - Click the **correct** option → **"You have answered correctly"** + explanation.
   - Click a **wrong** option → **"Yet to choose the correct answer"** + explanation;
     you may try again. Each question is worth one point, credited when you pick
     its correct option.
6. Use **Next Question**, then **Submit Quiz** on the last question. **Quit**
   abandons the attempt.
7. The **Scoreboard** shows your name, score, percentage, a formal verdict with a
   **letter grade** and a per-question review; **Play Again** returns to the
   setup. Your result is also added to the **Leaderboard** (use **Refresh** to
   reload it).

A hint line tells you whether the questions came from the online AI or the
offline bank.

---

## Exam Questions

The Exam Questions workspace presents a filter bar above a feed of question
cards.

1. Choose an **Exam** (GATE / UGC NET / All) and a **Topic** (or All).
2. Pick how many questions to show (5 / 10 / 20), then click **Load Questions**.
3. Each card shows a bracketed **source citation** (e.g. `[GATE CS 2021]`) next to
   the question and its options. Click an option to record your own answer —
   nothing is marked right or wrong while you do.
4. Click **Show Solution** to reveal the worked answer. The correct option is marked
   then, along with your own pick if it was wrong. **Hide Solution** collapses it
   again and clears the verdicts.
5. Click **Generate with AI** to create additional exam-style questions
   (requires an online AI provider; otherwise bank questions are shown).

---

## Learn, Download & Help

The fifth entry in the contents is a study annex in three parts.

### Learn

Eight working lessons explain the rules the reviewer checks for: primary keys and
entity integrity, foreign keys and referential integrity, `NOT NULL` / `UNIQUE`
rules, normalisation from 1NF to BCNF, why a many-to-many relationship needs a
junction table, naming conventions, indexes and foreign-key speed, and how to read
a review report.

- Click a lesson title to open it; **Expand all** opens all eight at once.
- Every lesson ends with a runnable example behind **Open in Reviewer**. Pressing it
  loads that example into section I, names the review after the lesson and runs the
  audit, so the rule can be watched being checked.
- Lesson 8 is deliberately imperfect — run it to see how a report reads before you
  trust the score.

### Download

Six files can be produced, all assembled inside the browser: nothing is uploaded and
nothing is stored on the server. A button stays greyed out until there is something
behind it, and the small line above it says what will be saved.

| Export | Format | Contains |
| --- | --- | --- |
| Review report | `.md` | Score, severities, findings with their fixes, tutor explanation |
| Review report | `.json` | The same audit as structured data |
| Designed schema | `.sql` | Every table currently in the Table Designer |
| Quiz score sheet | `.csv` | Your last attempt question by question, plus the top ten |
| Exam question set | `.csv` | The loaded questions, their options, the answer and the citation |
| Study notes | `.md` | All eight lessons with their examples |

The score sheet marks each question **correct on first try** or **correct after
retry** — the more useful column when revising.

### Help

A four-step quick start — review, design, drill, keep — followed by a short FAQ:
where the Groq key goes, which model answers, what the score measures, why a foreign
key can be reported invalid, why history empties on a free Render instance, and how
to print the page as a handout.

---

## Notes

- Without a `GROQ_API_KEY` the app runs fully offline using built-in banks. With a
  key the primary model is `qwen/qwen3.8-27b`, with `openai/gpt-oss-120b` as the
  automatic fallback.
- The name shown in the masthead, the browser tab and Help comes from
  `project_name.txt` in the repo root (or the `PROJECT_NAME` env var). Edit that one
  line and reload to rename the site.
- Exports are generated locally in the browser; the app never uploads your work.
- The built-in exam bank is representative practice material — always verify exact
  wording and official answer keys from the source papers.
