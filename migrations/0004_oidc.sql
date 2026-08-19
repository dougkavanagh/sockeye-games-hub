-- OIDC clients (pre-registered games) and short-lived authorization codes

CREATE TABLE oidc_client (
  client_id TEXT PRIMARY KEY NOT NULL,
  -- JSON array of allowed origin prefixes, e.g. ["https://final-quest.sockeyegames.org"]
  redirect_origins TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE oidc_auth_code (
  code_hash TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  active_profile_id TEXT REFERENCES kid_profile(id) ON DELETE SET NULL,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT
);

-- Pre-register all current games
INSERT INTO oidc_client (client_id, redirect_origins) VALUES
  ('final-quest',                 '["https://final-quest.sockeyegames.org","https://final-quest.pages.dev","http://localhost:5177","http://localhost:5180"]'),
  ('pizza-perfection',            '["https://pizza-perfection.sockeyegames.org","https://pizza-perfection.pages.dev","http://localhost:5177","http://localhost:5180"]'),
  ('pharoahs-tomb',               '["https://pharoahs-tomb.sockeyegames.org","https://pharoahs-tomb.pages.dev","http://localhost:5177","http://localhost:5180"]'),
  ('immunitd',                    '["https://immunitd.sockeyegames.org","https://immunitd.pages.dev","http://localhost:5177","http://localhost:5180"]'),
  ('dryou',                       '["https://dryou.sockeyegames.org","https://dryou.pages.dev","http://localhost:5177","http://localhost:5180"]'),
  ('temple-of-the-morning-star',  '["https://temple-of-the-morning-star.sockeyegames.org","https://temple-of-the-morning-star.pages.dev","http://localhost:5177","http://localhost:5180"]');
