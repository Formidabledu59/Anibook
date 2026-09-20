CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    universe_id INTEGER NOT NULL,
    icon TEXT,
    illustration TEXT,
    description TEXT,

    FOREIGN KEY (universe_id)
        REFERENCES universes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS character_tags (
    character_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,

    PRIMARY KEY (character_id, tag_id),

    FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);
