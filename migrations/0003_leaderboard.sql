CREATE TABLE leaderboard (
	id TEXT PRIMARY KEY NOT NULL,
	game_id TEXT NOT NULL,
	scenario_id TEXT NOT NULL,
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	display_name TEXT NOT NULL,
	persona_id TEXT NOT NULL,
	stars INTEGER NOT NULL,
	points INTEGER NOT NULL,
	misery REAL NOT NULL,
	days REAL NOT NULL,
	physician_mode INTEGER NOT NULL DEFAULT 0,
	set_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX idx_leaderboard_player ON leaderboard(game_id, scenario_id, user_id, persona_id, physician_mode);
CREATE INDEX idx_leaderboard_lookup ON leaderboard(game_id, scenario_id, physician_mode, stars DESC, points DESC, days ASC);
