-- Course reading quizzes: per-chapter + per-track finals; separate from legacy lesson-linked quizzes.

CREATE TABLE IF NOT EXISTS course_track_quizzes (
  id VARCHAR(64) PRIMARY KEY,
  track ENUM('cpp', 'web') NOT NULL,
  chapter_slug VARCHAR(64) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_am VARCHAR(255) NULL,
  xp_reward INT NOT NULL DEFAULT 15,
  coin_reward INT NOT NULL DEFAULT 5,
  is_final TINYINT(1) NOT NULL DEFAULT 0,
  pass_threshold INT NOT NULL DEFAULT 70,
  cert_min_score INT NULL COMMENT 'For finals: min % to count toward track certificate (e.g. 90)',
  KEY idx_track (track),
  KEY idx_track_final (track, is_final)
);

CREATE TABLE IF NOT EXISTS course_track_quiz_questions (
  id VARCHAR(64) PRIMARY KEY,
  quiz_id VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  question_en TEXT NOT NULL,
  question_am TEXT NOT NULL,
  options_json JSON NOT NULL,
  correct_answer VARCHAR(512) NOT NULL,
  KEY idx_quiz (quiz_id),
  CONSTRAINT fk_ctqq_quiz FOREIGN KEY (quiz_id) REFERENCES course_track_quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_track_quiz_attempts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  quiz_id VARCHAR(64) NOT NULL,
  score DECIMAL(6,2) NOT NULL,
  passed TINYINT(1) NOT NULL,
  answers_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user_quiz (user_id, quiz_id),
  CONSTRAINT fk_ctqa_quiz FOREIGN KEY (quiz_id) REFERENCES course_track_quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS track_completion_certificates (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  track ENUM('cpp', 'web') NOT NULL,
  verification_code VARCHAR(64) NOT NULL,
  pdf_url VARCHAR(512) NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_track (user_id, track),
  KEY idx_verify (verification_code)
);
