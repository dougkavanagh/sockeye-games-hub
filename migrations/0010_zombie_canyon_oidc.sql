-- Register Zombie Canyon as an OIDC client (early preview).

INSERT INTO oidc_client (client_id, redirect_origins) VALUES
  ('zombie-canyon', '["https://zombie-canyon.sockeyegames.org","https://zombie-canyon.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5182","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost","org.sockeyegames.zombie-canyon://callback"]');
