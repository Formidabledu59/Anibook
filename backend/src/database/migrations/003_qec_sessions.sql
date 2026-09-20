CREATE TABLE IF NOT EXISTS qec_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    universe_id INTEGER,
    tag_id INTEGER,
    board_size INTEGER NOT NULL,
    seed INTEGER NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (universe_id)
        REFERENCES universes(id)
        ON DELETE SET NULL,

    FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS qec_session_characters (
    session_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    position INTEGER NOT NULL,

    PRIMARY KEY (session_id, character_id),
    UNIQUE (session_id, position),

    FOREIGN KEY (session_id)
        REFERENCES qec_sessions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE
);
