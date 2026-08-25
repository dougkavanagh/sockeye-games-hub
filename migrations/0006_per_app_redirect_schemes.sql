-- Per-app redirect schemes for native shells.
--
-- 0005 added capacitor://localhost, which is the origin the WebView runs at.
-- It works, but it is the same string for every Capacitor app: routing a
-- callback to it needs `capacitor` registered in Info.plist, and two Sockeye
-- games installed side by side would then both claim it, leaving iOS to pick
-- one. A per-app scheme avoids that, and ASWebAuthenticationSession intercepts
-- its callbackURLScheme without any Info.plist registration at all.
--
-- Both are kept: capacitor://localhost stays valid for anything already using it.

UPDATE oidc_client SET redirect_origins = '["https://final-quest.sockeyegames.org","https://final-quest.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost","org.sockeyegames.final-quest://callback"]'
 WHERE client_id = 'final-quest';

UPDATE oidc_client SET redirect_origins = '["https://pizza-perfection.sockeyegames.org","https://pizza-perfection.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost","org.sockeyegames.pizza-perfection://callback"]'
 WHERE client_id = 'pizza-perfection';

UPDATE oidc_client SET redirect_origins = '["https://pharoahs-tomb.sockeyegames.org","https://pharoahs-tomb.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost","org.sockeyegames.pharoahs-tomb://callback"]'
 WHERE client_id = 'pharoahs-tomb';

UPDATE oidc_client SET redirect_origins = '["https://immunitd.sockeyegames.org","https://immunitd.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost","org.sockeyegames.immunitd://callback"]'
 WHERE client_id = 'immunitd';

UPDATE oidc_client SET redirect_origins = '["https://dryou.sockeyegames.org","https://dryou.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost","org.sockeyegames.dryou://callback"]'
 WHERE client_id = 'dryou';

UPDATE oidc_client SET redirect_origins = '["https://temple-of-the-morning-star.sockeyegames.org","https://temple-of-the-morning-star.pages.dev","http://localhost:5177","http://localhost:5180","http://localhost:5190","http://127.0.0.1:5190","capacitor://localhost","http://localhost","org.sockeyegames.temple-of-the-morning-star://callback"]'
 WHERE client_id = 'temple-of-the-morning-star';
