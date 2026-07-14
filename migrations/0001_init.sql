-- Sockeye Games hub schema (cookie-session auth, opaque game progress)

CREATE TABLE user (
	id TEXT PRIMARY KEY NOT NULL,
	email TEXT NOT NULL UNIQUE COLLATE NOCASE,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE magic_link (
	token_hash TEXT PRIMARY KEY NOT NULL,
	email TEXT NOT NULL COLLATE NOCASE,
	expires_at TEXT NOT NULL,
	consumed_at TEXT
);

CREATE TABLE kid_profile (
	id TEXT PRIMARY KEY NOT NULL,
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	display_name TEXT NOT NULL,
	birth_year INTEGER,
	grade_band TEXT,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE session (
	id TEXT PRIMARY KEY NOT NULL,
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	active_profile_id TEXT REFERENCES kid_profile(id) ON DELETE SET NULL,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE game_progress (
	profile_id TEXT NOT NULL REFERENCES kid_profile(id) ON DELETE CASCADE,
	game_id TEXT NOT NULL,
	blob TEXT NOT NULL,
	updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	PRIMARY KEY (profile_id, game_id)
);

CREATE INDEX idx_session_user ON session(user_id);
CREATE INDEX idx_kid_profile_user ON kid_profile(user_id);
CREATE INDEX idx_magic_link_email ON magic_link(email);
