-- Account deletion walks these tables by user_id. D1 does not enforce
-- foreign keys unless PRAGMA foreign_keys is on, so the delete helper
-- still issues explicit DELETEs. The FKs document the intended cascade.
--
-- Reports can arrive from a signed-out player (Apple 1.2), so reporter
-- is nullable. Blocks are per signed-in account and also stored on the
-- device so a local-only player can hide a row.

CREATE TABLE content_report (
	id TEXT PRIMARY KEY NOT NULL,
	reporter_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
	game_id TEXT NOT NULL,
	scenario_id TEXT,
	public_name TEXT NOT NULL,
	reason TEXT,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_content_report_created ON content_report(created_at);
CREATE INDEX idx_content_report_name ON content_report(public_name);

CREATE TABLE user_block (
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	public_name TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	PRIMARY KEY (user_id, public_name)
);

CREATE INDEX idx_user_block_name ON user_block(public_name);
