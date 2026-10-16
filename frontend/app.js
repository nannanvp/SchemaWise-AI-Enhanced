/* SchemaWise AI - frontend logic
   Sections: helpers | theme | nav drawer & tabs | stat animations
             | review (skeleton placeholders, score ring, render)
             | history | designer | quiz | exam */

const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[m]));
}

let toastTimer = null;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

async function api(path, options) {
  const res = await fetch(path, options);
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(detail);
  }
  return data;
}

function mdToHtml(md) {
  if (!md) return "";
  if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
    return DOMPurify.sanitize(marked.parse(md));
  }
  return esc(md).replace(/\n/g, "<br>");
}

function renderExplanation(md) {
  const box = $("explanation");
  if (!md) {
    box.textContent = "Run a review to see a student-friendly explanation.";
    return;
  }
  const parts = md.split(/^### /m).filter(Boolean);
  if (parts.length < 2 || typeof marked === "undefined") {
    box.innerHTML = mdToHtml(md);
    return;
  }
  box.innerHTML = parts.map((part) => {
    const [titleLine, ...rest] = part.split("\n");
    return `<div class="explanation-section">
      <h4>${esc(titleLine.trim())}</h4>
      ${mdToHtml(rest.join("\n").trim())}
    </div>`;
  }).join("");
}

/* ------------------------------------------------------------------ */
/* Theme                                                              */
/* ------------------------------------------------------------------ */
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  $("themeBtn").textContent = dark ? "Light" : "Dark";
  localStorage.setItem("schema-theme-v2", dark ? "dark" : "light");
}
$("themeBtn").onclick = () => applyTheme(!document.body.classList.contains("dark"));
applyTheme(localStorage.getItem("schema-theme-v2") === "dark");

/* ------------------------------------------------------------------ */
/* Project name (project_name.txt, served by /api/config)              */
/* ------------------------------------------------------------------ */
let projectName = "SchemaWise AI";

function applyProjectName(name) {
  const clean = String(name || "").trim().slice(0, 60);
  if (!clean) return;
  projectName = clean;

  // Wordmark: the final word keeps the italic accent, whatever the name is.
  const mark = $("mastheadName");
  if (mark) {
    const parts = clean.split(/\s+/);
    const last = parts.pop();
    mark.textContent = parts.length ? `${parts.join(" ")} ` : "";
    const em = document.createElement("em");
    em.textContent = last;
    mark.appendChild(em);
  }

  document.title = `${clean} · Schema Review, Designer, Quiz, Exam & Learn`;
  $$("[data-project-name]").forEach((el) => { el.textContent = clean; });
}

/* ------------------------------------------------------------------ */
/* Nav drawer & tabs                                                   */
/* ------------------------------------------------------------------ */
function setNavOpen(open) {
  document.body.classList.toggle("nav-open", open);
  const toggle = $("navToggle");
  if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

const navToggle = $("navToggle");
if (navToggle) {
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.onclick = () => setNavOpen(!document.body.classList.contains("nav-open"));
}
const navBackdrop = $("navBackdrop");
if (navBackdrop) navBackdrop.onclick = () => setNavOpen(false);

function setPageHeading(tab) {
  const title = $("pageTitle");
  const subtitle = $("pageSubtitle");
  if (title && tab.dataset.title !== undefined) title.textContent = tab.dataset.title;
  if (subtitle && tab.dataset.subtitle !== undefined) subtitle.textContent = tab.dataset.subtitle;
}

$$("#tabs .tab").forEach((tab) => {
  tab.onclick = () => {
    $$("#tabs .tab").forEach((t) => t.classList.toggle("active", t === tab));
    $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${tab.dataset.tab}`));
    setPageHeading(tab);
    setNavOpen(false);
  };
});

function openTab(name) {
  const tab = document.querySelector(`#tabs .tab[data-tab="${name}"]`);
  if (tab) tab.click();
}

/* ------------------------------------------------------------------ */
/* Stat animations                                                     */
/* ------------------------------------------------------------------ */
function prefersReducedMotion() {
  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Animate a number from 0 up to `target`; `format` builds the text. */
function countUp(el, target, format) {
  if (!el) return;
  const value = Number(target) || 0;
  const fmt = format || ((v) => String(v));
  if (prefersReducedMotion() || typeof window.requestAnimationFrame !== "function") {
    el.textContent = fmt(value);
    return;
  }
  if (el._countRaf) cancelAnimationFrame(el._countRaf);
  const duration = 700;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(Math.round(value * eased));
    if (t < 1) {
      el._countRaf = requestAnimationFrame(tick);
    } else {
      el._countRaf = null;
      el.textContent = fmt(value);
    }
  };
  el._countRaf = requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ */
/* Schema Review                                                      */
/* ------------------------------------------------------------------ */
let latest = null;

const samples = {
  1: `CREATE TABLE department (
  department_id INT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE student (
  student_id INT PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  department_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES department(department_id)
);`,
  2: `CREATE TABLE student (
  student_name VARCHAR(100),
  email VARCHAR(100),
  department_id INT
);`,
  3: `CREATE TABLE course (
  course_id INT PRIMARY KEY,
  course_name VARCHAR(120) NOT NULL,
  faculty_id INT,
  FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
);`,
  4: `CREATE TABLE student_record (
  student_id INT PRIMARY KEY,
  student_name VARCHAR(100),
  department_id INT,
  department_name VARCHAR(100),
  department_phone VARCHAR(30)
);

CREATE TABLE department (
  department_id INT PRIMARY KEY,
  department_name VARCHAR(100)
);`,
  5: `CREATE TABLE customer (
  customer_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE
);

CREATE TABLE product (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATE NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE order_item (
  order_item_id INT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id)
);

CREATE TABLE payment (
  payment_id INT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);`,
};

$("sqlInput").value = samples[1];

$$("[data-sample]").forEach((btn) => {
  btn.onclick = () => {
    const n = btn.dataset.sample;
    $("sqlInput").value = samples[n];
    $("schemaName").value = [
      "Correct Student Schema", "Missing Primary Key", "Invalid Foreign Key",
      "Normalization Example", "E-Commerce Schema",
    ][n - 1];
  };
});

function setSteps(active = -1, allDone = false) {
  Array.from($("steps").children).forEach((el, i) => {
    el.classList.remove("active", "done");
    if (allDone || i < active) el.classList.add("done");
    else if (i === active) el.classList.add("active");
  });
}

async function animateSteps() {
  for (let i = 0; i < 6; i++) {
    setSteps(i);
    await new Promise((r) => setTimeout(r, 90));
  }
}

/* Shimmer placeholders shown inside the output panes while a review runs. */
const reviewSkeletons = { vizHtml: null, vizEmpty: false, findingsHtml: null };

function showReviewSkeletons() {
  const viz = $("visualization");
  const findings = $("findings");
  if (viz) {
    reviewSkeletons.vizHtml = viz.innerHTML;
    reviewSkeletons.vizEmpty = viz.classList.contains("empty");
    viz.classList.remove("empty");
    viz.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
  }
  if (findings) {
    reviewSkeletons.findingsHtml = findings.innerHTML;
    findings.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
  }
}

/* Restore the panes as they were when the review attempt failed. */
function hideReviewSkeletons() {
  const viz = $("visualization");
  const findings = $("findings");
  if (viz && reviewSkeletons.vizHtml !== null) {
    viz.innerHTML = reviewSkeletons.vizHtml;
    viz.classList.toggle("empty", reviewSkeletons.vizEmpty);
  }
  if (findings && reviewSkeletons.findingsHtml !== null) {
    findings.innerHTML = reviewSkeletons.findingsHtml;
  }
  reviewSkeletons.vizHtml = null;
  reviewSkeletons.findingsHtml = null;
}

/* Circumference for the score ring, parsed from its stroke-dasharray. */
function ringCircumference(ring) {
  let raw = "";
  try { raw = window.getComputedStyle(ring).strokeDasharray || ""; } catch { /* ignore */ }
  if (!raw || raw === "none") raw = ring.getAttribute("stroke-dasharray") || "";
  let c = parseFloat(String(raw).split(/[,\s]+/)[0]);
  if (!c && ring.r && ring.r.baseVal) c = 2 * Math.PI * ring.r.baseVal.value;
  return c || 0;
}

function render(data) {
  latest = data;
  countUp($("score"), data.score, (v) => `${v}/100`);
  countUp($("tableCount"), data.tables.length);
  countUp($("errorCount"), data.counts.errors);
  countUp($("warningCount"), data.counts.warnings);
  countUp($("suggestionCount"), data.counts.suggestions);
  $("aiMode").textContent = data.ai_used ? "Online AI Tutor" : "Built-in AI Tutor";
  $("downloadBtn").disabled = false;

  /* Score ring: dashoffset = circumference * (1 - score/100) */
  const ring = $("scoreRingFill");
  if (ring) {
    const c = ringCircumference(ring);
    if (c > 0) {
      const pct = Math.max(0, Math.min(100, Number(data.score) || 0));
      ring.style.setProperty("stroke-dashoffset", String(c * (1 - pct / 100)));
    }
  }

  const viz = $("visualization");
  viz.classList.remove("empty");
  viz.innerHTML = `
    <div class="table-grid">
      ${data.tables.map((t) => `
        <div class="db-table">
          <div class="db-name">${esc(t.name)}</div>
          ${t.columns.map((c) => `
            <div class="db-column">
              <span>${t.primary_key.includes(c.name) ? `<span class="pk-badge">PK</span>` : ""}${esc(c.name)}</span>
              <span>${esc(c.type)}${t.foreign_keys.some((f) => f.column === c.name) ? " · FK" : ""}</span>
            </div>`).join("")}
        </div>`).join("")}
    </div>
    ${data.relationships.length ? `
      <div class="relationships">
        <h3>Relationships</h3>
        ${data.relationships.map((r) => `
          <div class="relationship"><b>${esc(r.from)}</b>.${esc(r.column)}
          → <b>${esc(r.to)}</b>.${esc(r.ref_column)}</div>`).join("")}
      </div>` : ""}`;

  const sevLabels = { error: "Error", warning: "Warning", suggestion: "Suggestion", passed: "Passed" };
  $("findings").innerHTML = data.findings.map((f) => `
    <div class="finding ${f.severity}">
      <span class="sev-label">${sevLabels[f.severity] || "Notice"}</span>
      <strong>${esc(f.title)}</strong>
      <p>${esc(f.message)}</p>
      ${f.fix ? `<p><b>Fix:</b> ${esc(f.fix)}</p>` : ""}
    </div>`).join("");

  renderExplanation(data.explanation);
  setSteps(-1, true);
}

async function fetchAiExplanation(sqlText, data) {
  $("aiMode").textContent = "Checking AI Tutor…";
  try {
    const aiData = await api("/api/ai-explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: sqlText, findings: data.findings, score: data.score }),
    });
    $("aiMode").textContent = aiData.ai_used ? "Online AI Tutor" : "Built-in AI Tutor";
    renderExplanation(aiData.explanation);
  } catch {
    $("aiMode").textContent = "Built-in AI Tutor";
  }
}

$("reviewBtn").onclick = async () => {
  const sql = $("sqlInput").value.trim();
  if (!sql) { toast("Enter SQL first."); return; }

  $("reviewBtn").disabled = true;
  $("reviewBtn").textContent = "Reviewing...";
  $("explanation").textContent = "Analysing schema...";
  showReviewSkeletons();
  await animateSteps();

  try {
    const data = await api("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema_name: $("schemaName").value || "Untitled Schema", sql }),
    });
    render(data);
    toast("Review completed");
    fetchAiExplanation(sql, data);
  } catch (err) {
    hideReviewSkeletons();
    $("explanation").textContent = err.message;
    setSteps();
    toast(err.message);
  } finally {
    $("reviewBtn").disabled = false;
    $("reviewBtn").textContent = "Review Schema";
  }
};

/* History drawer */
$("historyBtn").onclick = async () => {
  $("historyDrawer").classList.add("open");
  try {
    const data = await api("/api/history");
    $("historyList").innerHTML = data.length ? data.map((x) => `
      <div class="history-item" data-id="${x.id}">
        <b>${esc(x.schema_name)}</b> — ${x.score}/100
        <small>${esc(x.created_at)} · ${x.errors} error(s) · ${x.warnings} warning(s)</small>
      </div>`).join("") : `<div class="empty">No history yet.</div>`;

    $$(".history-item").forEach((item) => {
      item.onclick = async () => {
        const x = await api(`/api/history/${item.dataset.id}`);
        $("schemaName").value = x.schema_name;
        $("sqlInput").value = x.sql;
        render(x);
        $("historyDrawer").classList.remove("open");
        openTab("review");
      };
    });
  } catch (err) { toast(err.message); }
};
$("closeHistory").onclick = () => $("historyDrawer").classList.remove("open");

$("downloadBtn").onclick = () => {
  if (!latest) return;
  const report = `AI-Based Schema Reviewer Report

Schema: ${latest.schema_name}
Date: ${latest.created_at}
Score: ${latest.score}/100

Errors: ${latest.counts.errors}
Warnings: ${latest.counts.warnings}
Suggestions: ${latest.counts.suggestions}

FINDINGS
========
${latest.findings.map((f) => `${f.severity.toUpperCase()}: ${f.title}
${f.message}
${f.fix ? "Fix: " + f.fix : ""}`).join("\n\n")}

EXPLANATION
===========
${latest.explanation}
`;
  const blob = new Blob([report], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "schema-review-report.txt";
  a.click();
  URL.revokeObjectURL(a.href);
};

/* ------------------------------------------------------------------ */
/* Table Designer                                                     */
/* ------------------------------------------------------------------ */
const COLUMN_TYPES = [
  "INT", "BIGINT", "SMALLINT", "VARCHAR(50)", "VARCHAR(100)", "VARCHAR(150)",
  "VARCHAR(255)", "CHAR(10)", "TEXT", "DECIMAL(10,2)", "FLOAT", "DOUBLE",
  "BOOLEAN", "DATE", "DATETIME", "TIMESTAMP",
];

let designerTables = [];
try { designerTables = JSON.parse(localStorage.getItem("schema-designer") || "[]") || []; }
catch { designerTables = []; }

function saveDesigner() {
  localStorage.setItem("schema-designer", JSON.stringify(designerTables));
}

function fkTargets() {
  const out = [];
  designerTables.forEach((t) => {
    t.columns.forEach((c) => {
      if (c.name) out.push(`${t.name}.${c.name}`);
    });
  });
  return out;
}

function makeColumnRow(col = {}) {
  const row = document.createElement("div");
  row.className = "dt-col-row";
  row.innerHTML = `
    <input class="c-name" placeholder="column_name" value="${esc(col.name || "")}" />
    <select class="c-type">
      ${COLUMN_TYPES.map((t) => `<option ${t === (col.type || "INT") ? "selected" : ""}>${t}</option>`).join("")}
    </select>
    <label class="cb" title="Primary key"><input type="checkbox" class="c-pk" ${col.pk ? "checked" : ""} /></label>
    <label class="cb" title="Not null"><input type="checkbox" class="c-nn" ${col.nn ? "checked" : ""} /></label>
    <label class="cb" title="Unique"><input type="checkbox" class="c-uq" ${col.uq ? "checked" : ""} /></label>
    <select class="c-fk"></select>
    <button class="remove" title="Remove column">✕</button>`;

  const fkSelect = row.querySelector(".c-fk");
  const fillFk = (value) => {
    const targets = fkTargets();
    fkSelect.innerHTML = `<option value="">—</option>` +
      targets.map((t) => `<option ${t === value ? "selected" : ""}>${t}</option>`).join("");
  };
  fillFk(col.fk || "");

  const pk = row.querySelector(".c-pk");
  const nn = row.querySelector(".c-nn");
  pk.onchange = () => { if (pk.checked) nn.checked = true; };

  row.querySelector(".remove").onclick = () => {
    row.remove();
    if (!$("dtColumns").children.length) makeColumnRow();
  };
  return row;
}

function addColumnRow(col) {
  $("dtColumns").appendChild(makeColumnRow(col));
}

function refreshFkSelects() {
  $$("#dtColumns .c-fk").forEach((sel) => {
    const current = sel.value;
    const targets = fkTargets();
    sel.innerHTML = `<option value="">—</option>` +
      targets.map((t) => `<option ${t === current ? "selected" : ""}>${t}</option>`).join("");
  });
}

function readCurrentTable() {
  const name = ($("dtName").value || "").trim().toLowerCase().replace(/\s+/g, "_");
  const columns = [];
  $$("#dtColumns .dt-col-row").forEach((row) => {
    const cname = row.querySelector(".c-name").value.trim();
    if (!cname) return;
    columns.push({
      name: cname,
      type: row.querySelector(".c-type").value,
      pk: row.querySelector(".c-pk").checked,
      nn: row.querySelector(".c-nn").checked,
      uq: row.querySelector(".c-uq").checked,
      fk: row.querySelector(".c-fk").value,
    });
  });
  return { name, columns };
}

function tableToSql(table) {
  const lines = [];
  const pkCols = table.columns.filter((c) => c.pk).map((c) => c.name);
  const singlePk = pkCols.length === 1 ? pkCols[0] : null;

  table.columns.forEach((c) => {
    let def = `  ${c.name} ${c.type}`;
    if (singlePk && c.name === singlePk) def += " PRIMARY KEY";
    if (c.nn || (singlePk && c.name === singlePk)) def += " NOT NULL";
    if (c.uq) def += " UNIQUE";
    lines.push(def);
  });
  if (pkCols.length > 1) lines.push(`  PRIMARY KEY (${pkCols.join(", ")})`);
  table.columns.forEach((c) => {
    if (!c.fk) return;
    const [t, col] = c.fk.split(".");
    lines.push(`  FOREIGN KEY (${c.name}) REFERENCES ${t}(${col})`);
  });
  return `CREATE TABLE ${table.name} (\n${lines.join(",\n")}\n);`;
}

function renderDesigner() {
  const list = $("dtTableList");
  $("dtCount").textContent = `${designerTables.length} table${designerTables.length === 1 ? "" : "s"}`;
  if (!designerTables.length) {
    list.innerHTML = `<div class="empty">No tables designed yet.</div>`;
  } else {
    list.innerHTML = designerTables.map((t, i) => `
      <div class="dt-table-card">
        <div class="row">
          <div>
            <b>${esc(t.name)}</b>
            <small>${t.columns.length} column(s) · ${t.columns.filter((c) => c.pk).length} PK · ${t.columns.filter((c) => c.fk).length} FK</small>
          </div>
          <button class="secondary small" data-remove="${i}">Remove</button>
        </div>
      </div>`).join("");
    $$("[data-remove]").forEach((b) => {
      b.onclick = () => { designerTables.splice(Number(b.dataset.remove), 1); saveDesigner(); renderDesigner(); refreshFkSelects(); };
    });
  }
  $("dtSql").value = designerTables.map(tableToSql).join("\n\n");
  refreshFkSelects();
}

$("dtAddColumn").onclick = () => addColumnRow();

$("dtAddTable").onclick = () => {
  const table = readCurrentTable();
  if (!table.name) { toast("Enter a table name."); return; }
  if (!table.columns.length) { toast("Add at least one column."); return; }
  if (designerTables.some((t) => t.name === table.name)) { toast("That table name already exists."); return; }

  designerTables.push(table);
  saveDesigner();
  $("dtName").value = "";
  $("dtColumns").innerHTML = "";
  addColumnRow({ name: "id", type: "INT", pk: true, nn: true });
  renderDesigner();
  toast(`Table "${table.name}" added`);
};

$("dtClear").onclick = () => {
  if (!designerTables.length) return;
  if (!confirm("Remove all designed tables?")) return;
  designerTables = [];
  saveDesigner();
  renderDesigner();
};

$("dtCopy").onclick = async () => {
  const sql = $("dtSql").value.trim();
  if (!sql) { toast("Nothing to copy yet."); return; }
  try {
    await navigator.clipboard.writeText(sql);
    toast("SQL copied to clipboard");
  } catch {
    $("dtSql").select();
    document.execCommand("copy");
    toast("SQL copied");
  }
};

$("dtSend").onclick = () => {
  const sql = $("dtSql").value.trim();
  if (!sql) { toast("Add a table first."); return; }
  $("sqlInput").value = `${sql}\n`;
  if (!$("schemaName").value.trim() || $("schemaName").value === "Student Database") {
    $("schemaName").value = "Designed Schema";
  }
  openTab("review");
  toast("Sent to the SQL editor");
  $("reviewBtn").scrollIntoView({ behavior: "smooth", block: "center" });
};

/* ------------------------------------------------------------------ */
/* Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizState = {
  questions: [], answers: [], firstTry: [], missed: [], index: 0, score: 0,
  name: "Anonymous", topic: "DBMS", difficulty: "easy", active: false,
};

$$("#quizDifficulty button").forEach((btn) => {
  btn.onclick = () => {
    $$("#quizDifficulty button").forEach((b) => b.classList.toggle("active", b === btn));
  };
});

function selectedDifficulty() {
  const active = document.querySelector("#quizDifficulty button.active");
  return active ? active.dataset.level : "easy";
}

function resetQuizPanels() {
  $("quizRunPanel").hidden = true;
  $("quizResultPanel").hidden = true;
  $("quizSetupPanel").hidden = false;
}

$("quizStart").onclick = async () => {
  const name = ($("quizName").value || "").trim() || "Anonymous";
  const topic = ($("quizTopic").value || "").trim() || "DBMS (Database Management Systems)";
  const difficulty = selectedDifficulty();
  const count = Math.max(1, Math.min(20, parseInt($("quizCount").value, 10) || 5));

  $("quizStart").disabled = true;
  $("quizStart").textContent = "Generating…";
  $("quizSourceHint").textContent = "Preparing questions…";

  try {
    const data = await api("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty, count }),
    });

    const questions = data.questions || [];
    if (!questions.length) { toast("No questions returned. Try again."); return; }

    quizState.questions = questions;
    quizState.answers = new Array(questions.length).fill(null);
    quizState.firstTry = new Array(questions.length).fill(false);
    quizState.missed = new Array(questions.length).fill(false);
    quizState.index = 0;
    quizState.score = 0;
    quizState.name = name;
    quizState.topic = data.topic || topic;
    quizState.difficulty = data.difficulty || difficulty;
    quizState.active = true;

    $("quizSetupPanel").hidden = true;
    $("quizResultPanel").hidden = true;
    $("quizRunPanel").hidden = false;
    $("quizTopicTag").textContent = quizState.topic;
    $("quizDifficultyTag").textContent = quizState.difficulty.toUpperCase();
    $("quizSourceHint").textContent =
      data.source === "ai" ? "Questions generated by AI."
      : data.source === "ai+bank" ? "AI questions with extra bank questions."
      : "Offline question bank (AI unavailable).";
    renderQuestion();
  } catch (err) {
    toast(err.message);
    $("quizSourceHint").textContent = "";
  } finally {
    $("quizStart").disabled = false;
    $("quizStart").textContent = "Start Quiz";
  }
};

function renderQuestion() {
  const i = quizState.index;
  const q = quizState.questions[i];
  const total = quizState.questions.length;

  $("quizProgress").textContent = `Question ${i + 1} of ${total}`;
  $("quizScoreLive").textContent = `Score: ${quizState.score}`;
  $("quizProgressBar").style.width = `${(i / total) * 100}%`;
  $("quizQuestion").textContent = q.question;

  const letters = ["A", "B", "C", "D", "E", "F"];
  $("quizOptions").innerHTML = q.options.map((opt, idx) => `
    <button class="quiz-option" data-idx="${idx}">
      <span class="key">${letters[idx] || idx + 1}</span>
      <span>${esc(opt)}</span>
    </button>`).join("");

  $$("#quizOptions .quiz-option").forEach((btn) => {
    btn.onclick = () => chooseOption(Number(btn.dataset.idx));
  });

  $("quizFeedback").hidden = true;
  $("quizFeedback").className = "quiz-feedback";
  $("quizFeedback").innerHTML = "";
  $("quizNext").hidden = true;
  $("quizSubmit").hidden = true;
  $("quizQuit").hidden = false;
  if (i === total - 1) { $("quizSubmit").hidden = false; }
}

function chooseOption(idx) {
  const i = quizState.index;
  const q = quizState.questions[i];
  const feedback = $("quizFeedback");
  const buttons = $$("#quizOptions .quiz-option");

  if (quizState.answers[i] === true) return; // already solved

  if (quizState.answers[i] === null) quizState.answers[i] = false;

  if (idx === q.answer) {
    quizState.answers[i] = true;
    if (!quizState.firstTry[i]) {
      quizState.firstTry[i] = true;
      quizState.score += 1;
      $("quizScoreLive").textContent = `Score: ${quizState.score}`;
    }
    buttons.forEach((b, k) => {
      b.disabled = true;
      if (k === q.answer) b.classList.add("correct");
    });
    feedback.hidden = false;
    feedback.className = "quiz-feedback ok";
    feedback.innerHTML = `<b>You have answered correctly</b>
      ${q.explanation ? esc(q.explanation) : "Well done!"}`;

    if (i === quizState.questions.length - 1) {
      $("quizSubmit").hidden = false;
    } else {
      $("quizNext").hidden = false;
    }
  } else {
    const btn = buttons[idx];
    btn.classList.add("wrong");
    btn.disabled = true;
    quizState.missed[i] = true;
    feedback.hidden = false;
    feedback.className = "quiz-feedback bad";
    feedback.innerHTML = `<b>Yet to choose the correct answer</b>
      ${q.explanation ? esc(q.explanation) : "Look again at the other options."}`;
  }
}

$("quizNext").onclick = () => {
  if (quizState.index < quizState.questions.length - 1) {
    quizState.index += 1;
    renderQuestion();
  }
};

$("quizQuit").onclick = () => {
  if (!confirm("Quit the quiz? Your progress on this attempt will be lost.")) return;
  quizState.active = false;
  resetQuizPanels();
};

$("quizSubmit").onclick = async () => {
  const total = quizState.questions.length;
  const score = quizState.score;
  const percent = total ? Math.round((score / total) * 100) : 0;

  try {
    await api("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: quizState.name,
        topic: quizState.topic,
        difficulty: quizState.difficulty,
        score, total,
      }),
    });
  } catch (err) { toast(err.message); }

  showResult(score, total, percent);
  loadLeaderboard();
};

function showResult(score, total, percent) {
  $("quizRunPanel").hidden = true;
  $("quizSetupPanel").hidden = true;
  $("quizResultPanel").hidden = false;

  const cls = percent >= 70 ? "ok" : percent >= 40 ? "mid" : "bad";
  const verdict = percent >= 90 ? "Distinction"
    : percent >= 70 ? "Merit"
    : percent >= 40 ? "Pass"
    : "Needs revision";
  const grade = percent >= 90 ? "A+"
    : percent >= 80 ? "A"
    : percent >= 70 ? "B"
    : percent >= 60 ? "C"
    : percent >= 50 ? "D"
    : "F";

  const review = quizState.questions.map((q, i) => {
    const ok = q.options[q.answer];
    const label = quizState.firstTry[i]
      ? (quizState.missed[i] ? "Correct after retry" : "Correct")
      : "Not correct";
    return `<div class="rr ${quizState.firstTry[i] ? "ok" : "bad"}">
      <b>${i + 1}. ${label}</b>
      ${esc(q.question)}
      <small>Correct answer: <b>${esc(ok)}</b></small>
    </div>`;
  }).join("");

  $("quizResult").innerHTML = `
    <div class="big ${cls}">${percent}%<span class="grade">${grade}</span></div>
    <div class="who"><b>${esc(quizState.name)}</b> scored ${score} / ${total}</div>
    <div class="sub">${verdict} · ${esc(quizState.topic)} · ${esc(quizState.difficulty)}</div>
    <div class="result-review">${review}</div>`;
}

$("quizRetry").onclick = () => {
  resetQuizPanels();
  quizState.active = false;
};

async function loadLeaderboard() {
  try {
    const rows = await api("/api/quiz/leaderboard?limit=10");
    if (!rows.length) {
      $("leaderboard").innerHTML = `<div class="empty">No scores yet — be the first!</div>`;
      return;
    }
    $("leaderboard").innerHTML = rows.map((r, i) => `
      <div class="leader-row ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}">
        <span class="rank">#${i + 1}</span>
        <div>
          <b>${esc(r.player_name)}</b>
          <small>${esc(r.topic)} · ${esc(r.difficulty)} · ${esc(r.created_at)}</small>
        </div>
        <span class="pct">${r.percent}% <small>(${r.score}/${r.total})</small></span>
      </div>`).join("");
  } catch (err) { toast(err.message); }
}
$("leaderRefresh").onclick = loadLeaderboard;

/* ------------------------------------------------------------------ */
/* Competitive Exam Questions                                         */
/* ------------------------------------------------------------------ */
async function loadConfig() {
  try {
    const cfg = await api("/api/config");
    const status = $("aiStatus");
    status.textContent = cfg.ai_available ? "AI: online" : "AI: offline";
    status.className = `chip ${cfg.ai_available ? "ok" : "off"}`;
    const chain = (cfg.ai_models || []).join(" → ");
    status.title = cfg.ai_available
      ? `Groq AI is available${chain ? ` · ${chain}` : ""}`
      : "AI unavailable - using built-in banks";

    applyProjectName(cfg.app);

    const examSel = $("examFilter");
    examSel.innerHTML = `<option value="all">All exams</option>` +
      (cfg.exam_names || []).map((e) => `<option>${esc(e)}</option>`).join("");

    const topicSel = $("examTopicFilter");
    topicSel.innerHTML = `<option value="all">All topics</option>` +
      (cfg.exam_topics || []).map((tp) => `<option>${esc(tp)}</option>`).join("");

    if (!$("quizTopic").value) $("quizTopic").value = cfg.assigned_topic || "DBMS";
  } catch { /* non-fatal */ }
}

function renderExamCard(q, index) {
  const letters = ["A", "B", "C", "D", "E", "F"];
  // The correct option is deliberately NOT marked at render time: revealing it
  // is the job of the Show Solution toggle, so the answer is never given away.
  const answerIdx = (q.answer === null || q.answer === undefined || q.answer === "")
    ? -1 : Number(q.answer);
  const opts = (q.options || []).map((opt, idx) => `
    <div class="exam-option" role="button" tabindex="0" aria-pressed="false">
      <span class="key">${letters[idx] || idx + 1}</span>
      <span>${esc(opt)}</span>
    </div>`).join("");
  const solution = q.solution || q.explanation || "No solution provided.";
  return `
    <article class="exam-card">
      <div class="top">
        <span class="tag">${esc(q.tag || "Practice")}</span>
        <span class="exam-topic">Q${index + 1} · ${esc(q.topic || "")}</span>
      </div>
      <div class="exam-q">${esc(q.question)}</div>
      <div class="exam-options" data-answer="${Number.isFinite(answerIdx) ? answerIdx : -1}">${opts}</div>
      <button class="secondary toggle-sol">Show Solution</button>
      <div class="exam-solution" hidden><b>Answer &amp; Solution</b>${esc(solution)}</div>
    </article>`;
}

/* Correctness is painted only while the solution is on screen. A recorded pick
   stays neutral until then, so the answer is never given away early. */
function paintExamOptions(box, revealed) {
  const correct = Number(box.dataset.answer);
  box.querySelectorAll(".exam-option").forEach((opt, i) => {
    const picked = opt.classList.contains("picked");
    opt.classList.toggle("correct", revealed && i === correct);
    opt.classList.toggle("wrong", revealed && picked && i !== correct);
  });
}

/* Kept so the Download panel can export whatever is on screen. */
const examState = { questions: [] };

function renderExamList(questions) {
  examState.questions = questions || [];
  const list = $("examList");
  if (!questions.length) {
    list.innerHTML = `<div class="empty">No questions found for that filter.</div>`;
    return;
  }
  list.innerHTML = questions.map(renderExamCard).join("");

  // Self-test: options record a pick only, they never grade themselves.
  $$("#examList .exam-options").forEach((box) => {
    const pick = (opt) => {
      box.querySelectorAll(".exam-option").forEach((o) => {
        const on = o === opt;
        o.classList.toggle("picked", on);
        o.setAttribute("aria-pressed", on ? "true" : "false");
      });
      const revealed = !box.parentElement.querySelector(".exam-solution").hidden;
      paintExamOptions(box, revealed);
    };
    box.querySelectorAll(".exam-option").forEach((opt) => {
      opt.onclick = () => pick(opt);
      opt.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick(opt);
        }
      };
    });
  });

  $$("#examList .toggle-sol").forEach((btn) => {
    btn.onclick = () => {
      const sol = btn.nextElementSibling;
      const show = sol.hidden;
      sol.hidden = !show;
      btn.textContent = show ? "Hide Solution" : "Show Solution";

      const box = btn.previousElementSibling;
      if (!box || !box.classList.contains("exam-options")) return;
      paintExamOptions(box, show);
    };
  });
}

$("examLoad").onclick = async () => {
  const exam = $("examFilter").value;
  const topic = $("examTopicFilter").value;
  const limit = $("examLimit").value;
  $("examLoad").disabled = true;
  $("examLoad").textContent = "Loading…";
  try {
    const data = await api(`/api/exam/questions?exam=${encodeURIComponent(exam)}&topic=${encodeURIComponent(topic)}&limit=${limit}`);
    renderExamList(data.questions || []);
    toast(`${(data.questions || []).length} question(s) loaded`);
  } catch (err) { toast(err.message); }
  finally { $("examLoad").disabled = false; $("examLoad").textContent = "Load Questions"; }
};

$("examGenerate").onclick = async () => {
  const exam = $("examFilter").value === "all" ? "GATE" : $("examFilter").value;
  const topic = $("examTopicFilter").value === "all"
    ? ($("quizTopic").value || "DBMS") : $("examTopicFilter").value;
  const count = Math.min(10, parseInt($("examLimit").value, 10) || 5);

  $("examGenerate").disabled = true;
  $("examGenerate").textContent = "Generating…";
  try {
    const data = await api("/api/exam/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam, topic, count }),
    });
    renderExamList(data.questions || []);
    toast(data.source === "ai" ? "AI questions generated" : "AI unavailable - showing bank questions");
  } catch (err) { toast(err.message); }
  finally { $("examGenerate").disabled = false; $("examGenerate").textContent = "Generate with AI"; }
};

/* ------------------------------------------------------------------ */
/* Learn · Download · Help                                            */
/* ------------------------------------------------------------------ */

/* Hand a generated file to the browser. Nothing leaves the machine. */
function downloadFile(filename, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const slugify = (s) => String(s || "schema").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "schema";
const isoDate = () => new Date().toISOString().slice(0, 10);

const csvCell = (v) => `"${String(v === null || v === undefined ? "" : v).replace(/"/g, '""')}"`;
const csvRow = (cells) => cells.map(csvCell).join(",");

/* --- report, in Markdown -------------------------------------------- */
function reviewMarkdown(x) {
  const sev = { error: "Error", warning: "Warning", suggestion: "Suggestion", passed: "Passed" };
  const out = [
    `# Schema review — ${x.schema_name}`,
    "",
    `- **Score:** ${x.score}/100`,
    `- **Reviewed:** ${x.created_at}`,
    `- **Tutor:** ${x.ai_used ? "online AI" : "built-in"}`,
    `- **Findings:** ${x.counts.errors} error(s), ${x.counts.warnings} warning(s), ${x.counts.suggestions} suggestion(s), ${x.counts.passed || 0} passed`,
    "",
    "## Tables",
    "",
  ];
  x.tables.forEach((t) => {
    out.push(`### ${t.name}`, "", "| Column | Type | Key |", "| --- | --- | --- |");
    t.columns.forEach((c) => {
      const key = t.primary_key.includes(c.name) ? "PK"
        : t.foreign_keys.some((f) => f.column === c.name) ? "FK" : "";
      out.push(`| ${c.name} | ${c.type} | ${key} |`);
    });
    out.push("");
  });
  if (x.relationships.length) {
    out.push("### Relationships", "");
    x.relationships.forEach((r) => out.push(`- \`${r.from}.${r.column}\` → \`${r.to}.${r.ref_column}\``));
    out.push("");
  }
  out.push("## Findings", "");
  if (!x.findings.length) out.push("_No findings recorded._", "");
  x.findings.forEach((f) => {
    out.push(`### ${sev[f.severity] || "Notice"} — ${f.title}`, "", f.message, "");
    if (f.fix) out.push(`**Fix:** ${f.fix}`, "");
  });
  out.push("## Tutor explanation", "", x.explanation || "_None._", "");
  return out.join("\n");
}

/* --- the current quiz attempt, plus the leaderboard ------------------ */
async function quizCsv() {
  const total = quizState.questions.length;
  const percent = total ? Math.round((quizState.score / total) * 100) : 0;
  const out = [
    `# Quiz attempt — ${quizState.name} · ${quizState.topic} · ${quizState.difficulty} · ${isoDate()}`,
    `# Score ${quizState.score}/${total} (${percent}%) · ${quizState.missed.filter(Boolean).length} answered only after a retry`,
    csvRow(["#", "question", "correct answer", "result"]),
  ];
  quizState.questions.forEach((q, i) => {
    out.push(csvRow([
      i + 1, q.question, q.options[q.answer],
      quizState.firstTry[i]
        ? (quizState.missed[i] ? "correct after retry" : "correct on first try")
        : "not correct",
    ]));
  });
  out.push("", "# Leaderboard (top 10)", csvRow(["rank", "player", "topic", "difficulty", "score", "total", "percent", "when"]));
  try {
    const rows = await api("/api/quiz/leaderboard?limit=10");
    rows.forEach((r, i) => out.push(csvRow([
      i + 1, r.player_name, r.topic, r.difficulty, r.score, r.total, r.percent, r.created_at,
    ])));
  } catch {
    out.push(csvRow(["", "leaderboard unavailable", "", "", "", "", "", ""]));
  }
  return out.join("\r\n");
}

/* --- whatever is loaded in the Exam archive ------------------------- */
function examCsv() {
  const out = [csvRow([
    "#", "exam", "topic", "question", "option A", "option B", "option C", "option D",
    "answer", "citation", "solution",
  ])];
  examState.questions.forEach((q, i) => {
    const o = q.options || [];
    out.push(csvRow([
      i + 1, q.exam || "", q.topic || "", q.question,
      o[0] || "", o[1] || "", o[2] || "", o[3] || "",
      o[q.answer] || "", q.tag || "", q.solution || q.explanation || "",
    ]));
  });
  return out.join("\r\n");
}

/* --- the eight lessons, read back out of the document ---------------- */
function lessonsMarkdown() {
  const lessons = $$("#lessonList .lesson");
  const out = [
    `# ${projectName} — DBMS working lessons`,
    "",
    `${lessons.length} lessons · exported ${isoDate()}`,
    "",
    "---",
    "",
  ];
  lessons.forEach((d, i) => {
    const name = d.querySelector(".lesson-name").textContent.trim();
    const tag = d.querySelector(".lesson-tag").textContent.trim();
    out.push(`## ${i + 1}. ${name}${tag ? `  ·  _${tag}_` : ""}`, "");
    d.querySelectorAll(".lesson-body > p").forEach((p) => out.push(p.textContent.replace(/\s+/g, " ").trim(), ""));
    const points = [...d.querySelectorAll(".lesson-points li")];
    if (points.length) {
      points.forEach((li) => out.push(`- ${li.textContent.replace(/\s+/g, " ").trim()}`));
      out.push("");
    }
    const sql = d.querySelector(".lesson-sql");
    if (sql) out.push("```sql", sql.textContent.trim(), "```", "");
  });
  return out.join("\n");
}

const designerSql = () => designerTables.map(tableToSql).join("\n\n");

/* --- dispatch ------------------------------------------------------- */
const EXPORT_META = {
  "review-md": "review", "review-json": "review",
  "designer-sql": "designer", "quiz-csv": "quiz", "exam-csv": "exam",
  "lessons-md": "lessons",
};
const EXPORTS = {
  "review-md": () => latest && {
    name: `schema-review-${slugify(latest.schema_name)}.md`,
    text: reviewMarkdown(latest), mime: "text/markdown;charset=utf-8",
  },
  "review-json": () => latest && {
    name: `schema-review-${slugify(latest.schema_name)}.json`,
    text: JSON.stringify(latest, null, 2), mime: "application/json;charset=utf-8",
  },
  "designer-sql": () => designerTables.length && {
    name: `schema-${isoDate()}.sql`,
    text: `-- Designed in ${projectName} · ${isoDate()}\n\n${designerSql()}\n`,
    mime: "application/sql;charset=utf-8",
  },
  "quiz-csv": async () => quizState.questions.length && {
    name: `quiz-${slugify(quizState.name)}-${isoDate()}.csv`,
    text: await quizCsv(), mime: "text/csv;charset=utf-8",
  },
  "exam-csv": () => examState.questions.length && {
    name: `exam-questions-${isoDate()}.csv`,
    text: examCsv(), mime: "text/csv;charset=utf-8",
  },
  "lessons-md": () => ({
    name: "schemawise-lessons.md",
    text: lessonsMarkdown(), mime: "text/markdown;charset=utf-8",
  }),
};

$$("[data-export]").forEach((btn) => {
  btn.onclick = async () => {
    const build = EXPORTS[btn.dataset.export];
    if (!build) return;
    const spec = await build();
    if (!spec) { toast("There is nothing to export yet."); return; }
    downloadFile(spec.name, spec.text, spec.mime);
    toast(`${spec.name} saved`);
  };
});

/* Buttons grey out until there is something behind them. */
function refreshExportState() {
  const states = {
    review: latest
      ? [true, `${latest.score}/100 · ${latest.findings.length} finding(s)`]
      : [false, "Nothing yet — run a review first."],
    designer: designerTables.length
      ? [true, `${designerTables.length} table(s) ready`]
      : [false, "The designer is empty."],
    quiz: (! $("quizResultPanel").hidden && quizState.questions.length)
      ? [true, `${quizState.score}/${quizState.questions.length} · ${quizState.name}`]
      : [false, "No completed quiz yet."],
    exam: examState.questions.length
      ? [true, `${examState.questions.length} question(s) loaded`]
      : [false, "No questions loaded."],
    lessons: [true, `${$$("#lessonList .lesson").length} lessons ready`],
  };
  Object.entries(states).forEach(([key, [ready, text]]) => {
    $$(`[data-meta="${key}"]`).forEach((el) => {
      el.textContent = text;
      el.classList.toggle("is-ready", ready);
    });
    $$("[data-export]")
      .filter((b) => EXPORT_META[b.dataset.export] === key)
      .forEach((b) => { b.disabled = !ready; });
  });
}

/* --- lessons -------------------------------------------------------- */
$$("#lessonList .lesson-open").forEach((btn) => {
  btn.onclick = () => {
    const lesson = btn.closest(".lesson");
    const sql = lesson && lesson.querySelector(".lesson-sql");
    if (!sql) return;
    $("sqlInput").value = sql.textContent.trim();
    $("schemaName").value = lesson.querySelector(".lesson-name").textContent.trim();
    openTab("review");
    $("reviewBtn").click();
  };
});

const lessonToggleAll = $("lessonToggleAll");
if (lessonToggleAll) {
  lessonToggleAll.onclick = () => {
    const lessons = $$("#lessonList .lesson");
    const opening = lessons.some((d) => !d.open);
    lessons.forEach((d) => { d.open = opening; });
    lessonToggleAll.textContent = opening ? "Collapse all" : "Expand all";
  };
}

/* State only changes on the other sections, so refresh on arrival. */
const learnTab = document.querySelector('#tabs .tab[data-tab="learn"]');
if (learnTab) learnTab.addEventListener("click", refreshExportState);
refreshExportState();

/* ------------------------------------------------------------------ */
/* Boot                                                               */
/* ------------------------------------------------------------------ */
$("dtColumns").innerHTML = "";
addColumnRow({ name: "id", type: "INT", pk: true, nn: true });
renderDesigner();
loadConfig();
loadLeaderboard();
