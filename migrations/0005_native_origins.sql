-- Capacitor / iOS shells and ImmuniTD's local Vite port (5190).
-- iOS Capacitor origin is capacitor://localhost; Android is http://localhost.

UPDATE oidc_client SET redirect_origins = '["https://final-quest.sockeyegames.org","https://final-quest.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost"]'
 WHERE client_id = 'final-quest';

UPDATE oidc_client SET redirect_origins = '["https://pizza-perfection.sockeyegames.org","https://pizza-perfection.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost"]'
 WHERE client_id = 'pizza-perfection';

UPDATE oidc_client SET redirect_origins = '["https://pharoahs-tomb.sockeyegames.org","https://pharoahs-tomb.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost"]'
 WHERE client_id = 'pharoahs-tomb';

UPDATE oidc_client SET redirect_origins = '["https://immunitd.sockeyegames.org","https://immunitd.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost"]'
 WHERE client_id = 'immunitd';

UPDATE oidc_client SET redirect_origins = '["https://dryou.sockeyegames.org","https://dryou.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost"]'
 WHERE client_id = 'dryou';

UPDATE oidc_client SET redirect_origins = '["https://temple-of-the-morning-star.sockeyegames.org","https://temple-of-the-morning-star.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost"]'
 WHERE client_id = 'temple-of-the-morning-star';
