-- Register Peptidy as an OIDC client (early preview).

INSERT INTO oidc_client (client_id, redirect_origins) VALUES
  ('peptidy', '["https://peptidy.sockeyegames.org","https://peptidy.dougkavanagh.workers.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://localhost:5192","http://127.0.0.1:5190","http://127.0.0.1:5192","capacitor://localhost","http://localhost","org.sockeyegames.peptidy://callback"]');
