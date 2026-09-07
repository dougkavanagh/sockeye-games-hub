CREATE TABLE ticket_request (
	id TEXT PRIMARY KEY NOT NULL,
	user_id TEXT NOT NULL,
	email TEXT NOT NULL,
	game_id TEXT,
	repo TEXT NOT NULL,
	title TEXT NOT NULL,
	body TEXT NOT NULL,
	github_number INTEGER,
	github_url TEXT,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE INDEX idx_ticket_request_user ON ticket_request(user_id);
CREATE INDEX idx_ticket_request_created ON ticket_request(created_at);