-- A public name is the only thing a player's account shows to strangers, so it
-- is opt-in and set by the player. Until then there is nothing to publish.
ALTER TABLE user ADD COLUMN public_name TEXT;

-- Existing leaderboard rows carry a name derived from the email local part,
-- which nobody consented to. Retire those to a neutral placeholder; the row
-- picks up a real name the next time its owner sets one.
UPDATE leaderboard SET display_name = 'Player';
