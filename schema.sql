-- ============================================================================
-- PORTFOLIO CONTACT LEADS SCHEMA FOR HOSTINGER MYSQL / PHPMYADMIN
-- ============================================================================
-- Database: utf8mb4 / utf8mb4_unicode_ci
-- Compatible with: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Run this script inside Hostinger phpMyAdmin (SQL tab) or CLI.
-- ============================================================================

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT 'Lead full name or agency name',
  `email` VARCHAR(150) NOT NULL COMMENT 'Contact email address',
  `service` VARCHAR(100) NOT NULL COMMENT 'Requested Pillar: Visuals, Web & Apps, Marketing, Full Ecosystem',
  `budget` VARCHAR(50) NOT NULL DEFAULT 'Undisclosed' COMMENT 'Project budget tier estimate',
  `message` TEXT NOT NULL COMMENT 'Detailed project brief and scope',
  `ip_address` VARCHAR(45) NULL COMMENT 'Client IP for audit/spam monitoring',
  `user_agent` VARCHAR(255) NULL COMMENT 'Client browser device signature',
  `status` ENUM('new', 'in_review', 'contacted', 'archived') NOT NULL DEFAULT 'new' COMMENT 'Lead pipeline status',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Submission timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last record modification',
  
  -- Optimization indexes for fast dashboard queries and rate checks
  INDEX `idx_contacts_status` (`status`),
  INDEX `idx_contacts_email` (`email`),
  INDEX `idx_contacts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Portfolio inbound client project briefs';

-- ============================================================================
-- SAMPLE TEST RECORD (Optional seed data for verification)
-- ============================================================================
INSERT INTO `contacts` (`name`, `email`, `service`, `budget`, `message`, `ip_address`, `status`)
VALUES 
('Cyberpunk Apparel Co.', 'art-director@cyberapparel.io', 'Full Ecosystem', '$5,000 - $10,000', 'Need full brand identity refresh, 4K lookbook photoshoot, and custom Next.js eCommerce frontend connected to our inventory MySQL database.', '127.0.0.1', 'new');

-- ============================================================================
-- USEFUL MANAGEMENT QUERIES (For quick phpMyAdmin inspection)
-- ============================================================================
-- 1. View all new leads:
-- SELECT * FROM `contacts` WHERE `status` = 'new' ORDER BY `created_at` DESC;
--
-- 2. Group leads by service pillar:
-- SELECT `service`, COUNT(*) as total_leads FROM `contacts` GROUP BY `service`;
--
-- 3. Mark a lead as contacted:
-- UPDATE `contacts` SET `status` = 'contacted' WHERE `id` = 1;
