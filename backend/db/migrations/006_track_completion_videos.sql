-- Per-track optional YouTube resource — admin-managed; shown after track readings complete; watching is optional.
CREATE TABLE IF NOT EXISTS track_completion_videos (
  id CHAR(36) NOT NULL PRIMARY KEY,
  track ENUM('cpp', 'web') NOT NULL,
  youtube_url VARCHAR(1024) NOT NULL,
  title VARCHAR(512) NOT NULL,
  description TEXT NULL,
  thumbnail_url VARCHAR(1024) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_track_completion_track (track)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
