"""Built-in quiz question bank.

This ships a curated set of DBMS multiple-choice questions per difficulty so
the quiz still works when the AI provider is unavailable or rate limited
(for example on a Render free instance without a Groq key).

Every entry is a dict with:
    question     : str
    options      : list[str]  (exactly four)
    answer       : int        (index into ``options``)
    explanation  : str
"""

from __future__ import annotations

QUESTIONS: dict[str, list[dict]] = {
    "easy": [
        {
            "question": "Which key uniquely identifies each row of a table and cannot contain NULL values?",
            "options": ["Foreign key", "Primary key", "Alternate key", "Composite key"],
            "answer": 1,
            "explanation": "A primary key enforces uniqueness and NOT NULL for the chosen column(s), so it uniquely identifies every row.",
        },
        {
            "question": "In the relational model, a single row of a relation is called a:",
            "options": ["Attribute", "Domain", "Tuple", "Schema"],
            "answer": 2,
            "explanation": "Rows are tuples, columns are attributes, and the set of allowed values for an attribute is its domain.",
        },
        {
            "question": "Which SQL command permanently removes a table structure together with its data?",
            "options": ["DELETE", "TRUNCATE", "DROP", "ALTER"],
            "answer": 2,
            "explanation": "DROP TABLE removes both the definition and the data. DELETE and TRUNCATE only remove rows; ALTER modifies the structure.",
        },
        {
            "question": "An attribute in one table that refers to the primary key of another table is called a:",
            "options": ["Candidate key", "Foreign key", "Super key", "Secondary key"],
            "answer": 1,
            "explanation": "A foreign key creates a referential link to a key in another (or the same) table.",
        },
        {
            "question": "A relation is in Second Normal Form (2NF) if it is in 1NF and has no:",
            "options": ["Transitive dependency", "Partial dependency", "Multivalued dependency", "Join dependency"],
            "answer": 1,
            "explanation": "2NF removes partial dependencies (a non-prime attribute depending on part of a composite candidate key). 3NF removes transitive dependencies.",
        },
        {
            "question": "Which SQL clause filters the groups produced by GROUP BY?",
            "options": ["WHERE", "HAVING", "ORDER BY", "DISTINCT"],
            "answer": 1,
            "explanation": "WHERE filters rows before grouping; HAVING filters the aggregated groups afterwards.",
        },
        {
            "question": "Which of the following is a Data Manipulation Language (DML) statement?",
            "options": ["CREATE", "ALTER", "INSERT", "DROP"],
            "answer": 2,
            "explanation": "INSERT, UPDATE, DELETE and SELECT are DML. CREATE, ALTER, DROP and TRUNCATE are DDL.",
        },
        {
            "question": "In the ACID properties of a transaction, the letter 'I' stands for:",
            "options": ["Indexing", "Integrity", "Isolation", "Inheritance"],
            "answer": 2,
            "explanation": "ACID = Atomicity, Consistency, Isolation, Durability. Isolation keeps concurrent transactions from interfering.",
        },
    ],
    "medium": [
        {
            "question": "A relation R(A, B, C) has functional dependencies A\u2192B and B\u2192C. The highest normal form R satisfies is:",
            "options": ["1NF", "2NF", "3NF", "BCNF"],
            "answer": 1,
            "explanation": "A is the only candidate key. Since A\u2192C holds via B (a transitive dependency), R violates 3NF. As A is a single-attribute key there is no partial dependency, so R is in 2NF.",
        },
        {
            "question": "Which normal form is specifically designed to remove multivalued dependencies?",
            "options": ["2NF", "3NF", "4NF", "5NF"],
            "answer": 2,
            "explanation": "Fourth Normal Form (4NF) removes multivalued dependencies; 5NF handles join dependencies.",
        },
        {
            "question": "In a B+ tree, the record pointers for the indexed data are stored:",
            "options": ["At the root node", "At the internal nodes", "At the leaf nodes only", "At every node"],
            "answer": 2,
            "explanation": "B+ trees keep keys in internal nodes for navigation and store all record pointers at the leaf level, which are linked for range scans.",
        },
        {
            "question": "Which concurrency-control technique guarantees conflict serializability using a growing and a shrinking phase?",
            "options": ["Timestamp ordering", "Two-phase locking (2PL)", "Thomas write rule", "Optimistic validation"],
            "answer": 1,
            "explanation": "In 2PL a transaction only acquires locks during the growing phase; once it releases any lock it enters the shrinking phase.",
        },
        {
            "question": "Which join returns all rows from the left table plus matching rows from the right table, using NULLs for non-matches?",
            "options": ["INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "CROSS JOIN"],
            "answer": 1,
            "explanation": "A LEFT OUTER JOIN preserves every left-table row; unmatched right-side columns appear as NULL.",
        },
        {
            "question": "An SQL view is best described as:",
            "options": [
                "A physical copy of a table",
                "A stored query that behaves like a virtual table",
                "An index on a column",
                "A cached result of a join",
            ],
            "answer": 1,
            "explanation": "A view is a named, stored query. It is virtual - it usually stores no data of its own.",
        },
        {
            "question": "Conflict serializability of a schedule is tested by:",
            "options": [
                "Checking whether the schedule is recoverable",
                "Building a precedence graph and checking for cycles",
                "Counting the number of concurrent transactions",
                "Ensuring only one transaction runs at a time",
            ],
            "answer": 1,
            "explanation": "If the precedence (serialization) graph is acyclic the schedule is conflict serializable.",
        },
        {
            "question": "A minimal set of attributes that can uniquely identify a tuple is called a:",
            "options": ["Super key", "Candidate key", "Foreign key", "Primary key"],
            "answer": 1,
            "explanation": "A candidate key is a minimal super key - removing any attribute destroys its uniqueness.",
        },
    ],
    "hard": [
        {
            "question": "Consider R(A, B, C, D) with the FD set {A\u2192B, B\u2192C, C\u2192D, D\u2192A}. How many candidate keys does R have?",
            "options": ["1", "2", "3", "4"],
            "answer": 3,
            "explanation": "The dependencies form a cycle, so each attribute determines all others: A, B, C and D are all candidate keys - four in total.",
        },
        {
            "question": "The timestamp-ordering protocol is free from deadlocks because:",
            "options": [
                "It always acquires locks in increasing order",
                "Transactions never wait for each other; conflicting operations cause an abort and restart",
                "It only has a growing phase",
                "It always commits in timestamp order",
            ],
            "answer": 1,
            "explanation": "No locks are held, so no waiting-for cycle can form. Conflicts lead to rollback and re-execution with a new timestamp.",
        },
        {
            "question": "A decomposition of R into R1 and R2 is a lossless-join decomposition if:",
            "options": [
                "R1 \u2229 R2 = \u2205",
                "R1 \u2229 R2 \u2192 R1 or R1 \u2229 R2 \u2192 R2",
                "R1 \u222a R2 = R",
                "R1 \u2229 R2 is a foreign key",
            ],
            "answer": 1,
            "explanation": "The common attributes must be a super key of at least one of the two fragments for the join to be lossless.",
        },
        {
            "question": "Which of the following is NOT a valid Armstrong axiom / inference rule?",
            "options": ["Reflexivity", "Augmentation", "Transitivity", "Distribution"],
            "answer": 3,
            "explanation": "Armstrong's axioms are Reflexivity, Augmentation and Transitivity (plus derived Union, Decomposition and Pseudo-transitivity). 'Distribution' is not one of them.",
        },
        {
            "question": "A schedule is said to be recoverable if:",
            "options": [
                "It is conflict serializable",
                "A transaction commits only after every transaction whose data it read has committed",
                "It never deadlocks",
                "It uses strict two-phase locking",
            ],
            "answer": 1,
            "explanation": "Recoverability protects against losing an update after a dirty read, by deferring commits appropriately.",
        },
        {
            "question": "A relation has attributes {A, B, C} and only the FD A\u2192B. How many superkeys does the relation have?",
            "options": ["2", "3", "4", "8"],
            "answer": 2,
            "explanation": "Every superkey must contain A. Choosing any subset of the remaining two attributes gives 2\u00b2 = 4 superkeys: {A}, {A,B}, {A,C}, {A,B,C}.",
        },
        {
            "question": "Which normal form removes join dependencies so that a relation cannot be decomposed further without loss?",
            "options": ["3NF", "4NF", "5NF (PJNF)", "2NF"],
            "answer": 2,
            "explanation": "Fifth Normal Form, also called Project-Join Normal Form, removes join dependencies.",
        },
        {
            "question": "Transaction T1 updates a row but has not yet committed. Transaction T2 reads that uncommitted value. This anomaly is called:",
            "options": ["Phantom read", "Dirty read", "Lost update", "Repeatable read"],
            "answer": 1,
            "explanation": "Reading uncommitted data is a dirty read, and it can become unrecoverable if T1 later rolls back.",
        },
    ],
}


def get_bank_questions(difficulty: str, count: int, topic: str = "DBMS") -> list[dict]:
    """Return up to ``count`` questions for a difficulty from the built-in bank.

    Questions are tagged with ``difficulty`` and ``topic`` so the frontend can
    render them identically to AI-generated ones. If more questions are asked
    than the bank holds, the bank is cycled.
    """
    level = (difficulty or "easy").strip().lower()
    pool = QUESTIONS.get(level) or QUESTIONS["easy"]

    result: list[dict] = []
    index = 0
    while len(result) < max(1, count):
        base = pool[index % len(pool)]
        result.append(
            {
                "question": base["question"],
                "options": list(base["options"]),
                "answer": base["answer"],
                "explanation": base["explanation"],
                "difficulty": level,
                "topic": topic,
            }
        )
        index += 1
        if index > len(pool) * 4:  # safety valve
            break
    return result
