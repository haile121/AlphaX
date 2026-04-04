-- Normalize NULL streak values so leaderboard always shows a number.
-- Safe to run multiple times.

UPDATE users SET streak = 0 WHERE streak IS NULL;
