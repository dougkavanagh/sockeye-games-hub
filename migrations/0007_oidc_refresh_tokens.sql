-- Refresh tokens for offline_access (native / long-lived Bearer clients).
-- Opaque tokens are stored hashed; rotated on every refresh_token grant.

ALTER TABLE oidc_auth_code ADD COLUMN scope TEXT NOT NULL DEFAULT 'openid';

CREATE TABLE oidc_refresh_token (
  token_hash TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  active_profile_id TEXT REFERENCES kid_profile(id) ON DELETE SET NULL,
  scope TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX oidc_refresh_token_user_client_idx
  ON oidc_refresh_token(user_id, client_id);
