-- Course reading progress (static curriculum lesson ids: ch1-p1, ch2-p1, …)
-- Run once against your MySQL database, e.g.:
--   mysql -u USER -p DB_NAME < backend/db/migrations/001_course_reading_progress.sql

CREATE TABLE IF NOT EXISTS course_reading_progress (
  user_id VARCHAR(64) NOT NULL,
  lesson_id VARCHAR(32) NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  KEY idx_crp_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
