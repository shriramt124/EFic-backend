-- MySQL schema for the next-tiptap admin panel
-- Run this script inside your MySQL database (e.g. via phpMyAdmin) before starting the app.

CREATE TABLE IF NOT EXISTS categories (
  id CHAR(36) NOT NULL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NULL,
  content_html LONGTEXT NULL,
  content_json JSON NULL,
  cover_image_url VARCHAR(1000) NULL,
  read_time INT NULL,
  url VARCHAR(1000) NULL,
  author VARCHAR(255) NULL,
  tags JSON NULL,
  category_id CHAR(36) NULL,
  published TINYINT(1) DEFAULT 0,
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_posts_slug (slug),
  INDEX idx_posts_published (published, published_at),
  INDEX idx_posts_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) NOT NULL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  thumbnail_url VARCHAR(1000) NULL,
  repo_url VARCHAR(1000) NULL,
  live_url VARCHAR(1000) NULL,
  tags JSON NULL,
  featured TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_projects_slug (slug),
  INDEX idx_projects_featured (featured, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  question TEXT NOT NULL,
  answer_html LONGTEXT NULL,
  answer_json JSON NULL,
  order_index INT DEFAULT 0,
  published TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_faqs_order (order_index),
  INDEX idx_faqs_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
