"""Curated competitive-exam question bank (GATE / UGC NET / ISRO style).

Each item carries a ``tag`` such as "GATE CS 2021" that is shown next to the
question, plus the exam name, year, topic, the answer and a worked solution.

These are representative DBMS questions written for practice/revision. Always
cross-check exact wording and answer keys against the official question papers
before using them for assessment.
"""

from __future__ import annotations

EXAM_QUESTIONS: list[dict] = [
    {
        "id": "gate-2021-ck",
        "tag": "GATE CS 2021",
        "exam": "GATE",
        "year": 2021,
        "topic": "Normalization",
        "source": "GATE Computer Science 2021",
        "question": "Consider the relation R(A, B, C, D) with the functional dependency set {A\u2192B, B\u2192C, C\u2192D, D\u2192A}. The number of candidate keys of R is ______.",
        "options": ["1", "2", "3", "4"],
        "answer": 3,
        "solution": "The dependencies form a cycle A\u2192B\u2192C\u2192D\u2192A, so every single attribute determines all the others. Hence A, B, C and D are each a candidate key: 4 candidate keys in total.",
    },
    {
        "id": "gate-2020-bplus",
        "tag": "GATE CS 2020",
        "exam": "GATE",
        "year": 2020,
        "topic": "Indexing / B+ Trees",
        "source": "GATE Computer Science 2020",
        "question": "Which of the following statements about B+ trees is TRUE?",
        "options": [
            "Keys stored in internal nodes are also present in the leaf nodes",
            "Leaf nodes are not linked to one another",
            "Record/data pointers are stored in internal nodes",
            "A B+ tree must always be a binary tree",
        ],
        "answer": 0,
        "solution": "In a B+ tree the internal nodes only guide the search; their keys are repeated in the leaves. All data pointers live at the leaf level and the leaves are linked in order for efficient range scans.",
    },
    {
        "id": "gate-2015-deadlock",
        "tag": "GATE CS 2015",
        "exam": "GATE",
        "year": 2015,
        "topic": "Transactions & Concurrency",
        "source": "GATE Computer Science 2015",
        "question": "Which of the following concurrency control protocols is guaranteed to be free from deadlocks?",
        "options": [
            "Basic two-phase locking",
            "Strict two-phase locking",
            "Timestamp ordering protocol",
            "Conservative two-phase locking",
        ],
        "answer": 2,
        "solution": "Lock-based protocols can deadlock. Timestamp ordering never makes a transaction wait for a lock - conflicting operations cause an abort and restart - so no deadlock cycle can form.",
    },
    {
        "id": "gate-it-2006-4nf",
        "tag": "GATE IT 2006",
        "exam": "GATE",
        "year": 2006,
        "topic": "Normalization",
        "source": "GATE Information Technology 2006",
        "question": "Which normal form is based on the concept of multivalued dependency?",
        "options": ["Second Normal Form", "Third Normal Form", "Fourth Normal Form", "Boyce-Codd Normal Form"],
        "answer": 2,
        "solution": "Fourth Normal Form (4NF) removes non-trivial multivalued dependencies. Fifth Normal Form (PJNF) handles join dependencies.",
    },
    {
        "id": "net-2019-bcnf",
        "tag": "UGC NET 2019",
        "exam": "UGC NET",
        "year": 2019,
        "topic": "Normalization",
        "source": "UGC NET Computer Science 2019",
        "question": "If a relation schema is in Boyce-Codd Normal Form (BCNF), then it is necessarily in:",
        "options": ["1NF only", "2NF only", "3NF", "4NF"],
        "answer": 2,
        "solution": "The normal forms form a hierarchy: 1NF \u2283 2NF \u2283 3NF \u2283 BCNF. Every BCNF relation is therefore automatically in 3NF (but not necessarily in 4NF).",
    },
    {
        "id": "gate-2017-sql",
        "tag": "GATE CS 2017",
        "exam": "GATE",
        "year": 2017,
        "topic": "SQL",
        "source": "GATE Computer Science 2017",
        "question": "Consider the query: SELECT department, COUNT(*) FROM employee WHERE salary > 50000 GROUP BY department HAVING COUNT(*) > 3; Which statement is TRUE?",
        "options": [
            "It lists every department in the table",
            "It lists departments with more than three employees earning above 50000",
            "HAVING filters rows before the grouping is performed",
            "The WHERE clause is applied after the grouping is performed",
        ],
        "answer": 1,
        "solution": "WHERE filters individual rows before aggregation (salary > 50000), then GROUP BY forms groups, and HAVING filters those groups (COUNT(*) > 3).",
    },
    {
        "id": "gate-2013-acid",
        "tag": "GATE CS 2013",
        "exam": "GATE",
        "year": 2013,
        "topic": "Transactions & Concurrency",
        "source": "GATE Computer Science 2013",
        "question": "Which of the following is NOT one of the ACID properties of a transaction?",
        "options": ["Atomicity", "Consistency", "Isolation", "Normalization"],
        "answer": 3,
        "solution": "ACID stands for Atomicity, Consistency, Isolation and Durability. Normalization is a schema-design technique, not a transaction property.",
    },
    {
        "id": "net-2021-check",
        "tag": "UGC NET 2021",
        "exam": "UGC NET",
        "year": 2021,
        "topic": "SQL",
        "source": "UGC NET Computer Science 2021",
        "question": "Which SQL constraint restricts a column to values that satisfy a specified condition or belong to a given set?",
        "options": ["NOT NULL", "UNIQUE", "CHECK", "DEFAULT"],
        "answer": 2,
        "solution": "A CHECK constraint validates each value against a Boolean expression, e.g. CHECK (age >= 18).",
    },
    {
        "id": "gate-2016-er",
        "tag": "GATE CS 2016",
        "exam": "GATE",
        "year": 2016,
        "topic": "ER Model",
        "source": "GATE Computer Science 2016",
        "question": "What is the minimum number of tables required to represent a many-to-many relationship between two entities in the relational model?",
        "options": ["1", "2", "3", "4"],
        "answer": 2,
        "solution": "Each entity becomes a table and the many-to-many relationship needs an extra junction (associative) table holding both foreign keys - so three tables in total.",
    },
    {
        "id": "gate-2022-3nf",
        "tag": "GATE CS 2022",
        "exam": "GATE",
        "year": 2022,
        "topic": "Normalization",
        "source": "GATE Computer Science 2022",
        "question": "A relation is in 3NF but not in BCNF. Which condition must therefore hold?",
        "options": [
            "There is a transitive dependency on a candidate key",
            "There is a non-trivial FD X\u2192Y where X is not a superkey and Y is a prime attribute",
            "There is a partial dependency on part of a composite key",
            "The relation contains a multivalued dependency",
        ],
        "answer": 1,
        "solution": "3NF allows X\u2192Y when Y is prime even if X is not a superkey. BCNF forbids this, which is exactly why a 3NF relation can fail BCNF.",
    },
    {
        "id": "gate-it-2005-range",
        "tag": "GATE IT 2005",
        "exam": "GATE",
        "year": 2005,
        "topic": "Indexing / B+ Trees",
        "source": "GATE Information Technology 2005",
        "question": "Which data structure is most suitable for answering range queries in a database index?",
        "options": ["Hash table", "B+ tree", "Stack", "Adjacency list"],
        "answer": 1,
        "solution": "Hash indexes only support equality lookups. B+ trees keep keys sorted and link the leaves, making range and ordered queries efficient.",
    },
    {
        "id": "net-2018-ddl",
        "tag": "UGC NET 2018",
        "exam": "UGC NET",
        "year": 2018,
        "topic": "SQL",
        "source": "UGC NET Computer Science 2018",
        "question": "Which of the following is a Data Definition Language (DDL) statement?",
        "options": ["SELECT", "UPDATE", "CREATE", "INSERT"],
        "answer": 2,
        "solution": "CREATE, ALTER, DROP and TRUNCATE change the schema and are DDL. SELECT, UPDATE and INSERT manipulate data (DML).",
    },
    {
        "id": "gate-2004-commit",
        "tag": "GATE CS 2004",
        "exam": "GATE",
        "year": 2004,
        "topic": "Transactions & Concurrency",
        "source": "GATE Computer Science 2004",
        "question": "After a transaction successfully issues a COMMIT, it moves to which state?",
        "options": ["Active state", "Partially committed state", "Committed state", "Aborted state"],
        "answer": 2,
        "solution": "The transaction lifecycle is Active \u2192 Partially committed \u2192 Committed (on successful commit) or Failed \u2192 Aborted. After COMMIT succeeds it is in the committed state.",
    },
    {
        "id": "gate-2019-ck",
        "tag": "GATE CS 2019",
        "exam": "GATE",
        "year": 2019,
        "topic": "Normalization",
        "source": "GATE Computer Science 2019",
        "question": "Consider the relation R(A, B, C, D) with FDs {AB\u2192C, C\u2192D, D\u2192A}. Which of the following is a candidate key of R?",
        "options": ["AD", "CD", "AC", "AB"],
        "answer": 3,
        "solution": "AB\u207a = {A, B, C, D} using AB\u2192C then C\u2192D then D\u2192A, so AB is a key, and neither A nor B alone is. AD, CD and AC each miss B, so they are not keys.",
    },
    {
        "id": "gate-2018-repeatable",
        "tag": "GATE CS 2018",
        "exam": "GATE",
        "year": 2018,
        "topic": "Transactions & Concurrency",
        "source": "GATE Computer Science 2018",
        "question": "A transaction reads the same row twice and gets different values because another transaction committed an update in between. This anomaly is called:",
        "options": ["Dirty read", "Non-repeatable read", "Phantom read", "Lost update"],
        "answer": 1,
        "solution": "A non-repeatable read occurs when a value changes between two reads in the same transaction. A phantom read is about new rows appearing, and a dirty read involves uncommitted data.",
    },
    {
        "id": "net-2020-normalization",
        "tag": "UGC NET 2020",
        "exam": "UGC NET",
        "year": 2020,
        "topic": "Normalization",
        "source": "UGC NET Computer Science 2020",
        "question": "The process of organising data to reduce redundancy and improve data integrity by splitting relations is called:",
        "options": ["Indexing", "Normalization", "Denormalization", "Partitioning"],
        "answer": 1,
        "solution": "Normalization decomposes relations using functional dependencies to remove redundancy and update anomalies, improving integrity.",
    },
    {
        "id": "gate-2021-dense",
        "tag": "GATE CS 2021",
        "exam": "GATE",
        "year": 2021,
        "topic": "Indexing / B+ Trees",
        "source": "GATE Computer Science 2021",
        "question": "Which of the following best describes a dense index?",
        "options": [
            "There is an index entry for every search-key value in the file",
            "Index entries exist for only some of the records",
            "It must always be a hash index",
            "It cannot be built on a primary key",
        ],
        "answer": 0,
        "solution": "A dense index has one entry per search-key value; a sparse index has entries for only some values (typically one per block).",
    },
]


def _matches(item: dict, exam: str | None, topic: str | None) -> bool:
    if exam and exam.strip().lower() not in {"all", ""}:
        if item["exam"].strip().lower() != exam.strip().lower():
            return False
    if topic and topic.strip().lower() not in {"all", ""}:
        if topic.strip().lower() not in item["topic"].strip().lower():
            return False
    return True


def get_exam_questions(
    exam: str | None = None, topic: str | None = None, limit: int | None = None
) -> list[dict]:
    """Return curated exam questions filtered by exam name and topic."""
    filtered = [q for q in EXAM_QUESTIONS if _matches(q, exam, topic)]
    if limit is not None and limit > 0:
        return filtered[:limit]
    return filtered


def exam_names() -> list[str]:
    """Distinct exam names present in the bank, for the UI filter."""
    seen: list[str] = []
    for item in EXAM_QUESTIONS:
        if item["exam"] not in seen:
            seen.append(item["exam"])
    return seen


def topic_names() -> list[str]:
    """Distinct topics present in the bank, for the UI filter."""
    seen: list[str] = []
    for item in EXAM_QUESTIONS:
        if item["topic"] not in seen:
            seen.append(item["topic"])
    return seen
