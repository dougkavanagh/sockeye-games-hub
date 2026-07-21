CREATE TABLE contact_message (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	role TEXT,
	message TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
