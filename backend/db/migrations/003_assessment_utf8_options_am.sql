-- Amharic placement: UTF-8 table + optional Amharic option labels (aligned by index with options_json).
-- Run: npm run migrate:003 (from backend/)

ALTER TABLE assessment_questions
  ADD COLUMN options_am_json JSON NULL DEFAULT NULL AFTER options_json;

ALTER TABLE assessment_questions
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
