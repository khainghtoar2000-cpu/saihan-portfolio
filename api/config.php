<?php
/**
 * ============================================================================
 * DATABASE & APPLICATION CONFIGURATION (Hostinger MySQL & PHP)
 * ============================================================================
 * File: api/config.php
 * Instructions:
 * 1. Create a MySQL database and user in your Hostinger cPanel / hPanel.
 * 2. Update the credentials below with your Hostinger DB details.
 * 3. Import schema.sql into your database via phpMyAdmin.
 * ============================================================================
 */

// Strict error reporting for development (set to 0 in production)
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Set default timezone
date_default_timezone_set('UTC');

// ============================================================================
// 1. HOSTINGER MYSQL DATABASE CREDENTIALS (REPLACE WITH YOUR OWN)
// ============================================================================
define('DB_HOST', 'localhost');                    // Hostinger MySQL Host (usually 'localhost' or '127.0.0.1')
define('DB_NAME', 'u123456789_portfolio_db');       // e.g. u123456789_portfolio
define('DB_USER', 'u123456789_dbuser');             // e.g. u123456789_admin
define('DB_PASS', 'YourSecurePasswordHere!#2026');  // Your Hostinger MySQL user password
define('DB_PORT', 3306);
define('DB_CHARSET', 'utf8mb4');

// ============================================================================
// 2. LEAD NOTIFICATION EMAIL SETTINGS (OPTIONAL)
// ============================================================================
// Set to your personal email to receive instant alerts when a lead submits the form
define('ADMIN_EMAIL', 'khainghtoar2000@gmail.com');
define('SITE_DOMAIN', 'shootonstrangers.eu');
define('ENABLE_EMAIL_ALERTS', false); // Set to true once mail server is configured

// ============================================================================
// 3. SECURITY & CORS SETTINGS
// ============================================================================
// Allow requests only from your own domain (or * for open API / development)
define('ALLOWED_ORIGIN', '*');

/**
 * Returns a singleton PDO instance with strict error modes & security attributes.
 *
 * @return PDO
 * @throws PDOException
 */
function getDBConnection(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE " . DB_CHARSET . "_unicode_ci"
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Log database error silently without exposing sensitive credentials to client
            error_log('[Portfolio DB Error] ' . $e->getMessage());
            throw new PDOException('Database connection failed. Please verify Hostinger MySQL credentials in api/config.php.');
        }
    }

    return $pdo;
}

/**
 * Helper to output standardized JSON responses and terminate execution.
 *
 * @param bool $success
 * @param string $message
 * @param array $data
 * @param int $statusCode
 */
function sendJsonResponse(bool $success, string $message, array $data = [], int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');

    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data,
        'timestamp' => time()
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
