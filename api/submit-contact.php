<?php
/**
 * ============================================================================
 * SECURE CONTACT / LEAD SUBMISSION ENDPOINT
 * ============================================================================
 * File: api/submit-contact.php
 * Method: POST (JSON or FormData)
 * Output: application/json
 * ============================================================================
 */

require_once __DIR__ . '/config.php';

// Handle CORS Preflight OPTIONS Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    http_response_code(204);
    exit;
}

// Only permit POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Method Not Allowed. Only POST requests are supported.', [], 405);
}

// ----------------------------------------------------------------------------
// 1. EXTRACT & DECODE PAYLOAD (Supports both JSON & Standard Form Data)
// ----------------------------------------------------------------------------
$rawInput = file_get_contents('php://input');
$data = [];

if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        $data = $decoded;
    }
}

// Fallback to $_POST if JSON body was empty
if (empty($data)) {
    $data = $_POST;
}

// ----------------------------------------------------------------------------
// 2. ANTI-SPAM HONEYPOT CHECK
// ----------------------------------------------------------------------------
// Bots will automatically fill hidden honeypot fields.
if (!empty($data['website_trap']) || !empty($data['_gotcha']) || !empty($data['company_secret_check'])) {
    // Silently simulate success to prevent bots from circumventing the trap
    sendJsonResponse(true, 'Brief transmitted successfully.', ['id' => 0], 200);
}

// ----------------------------------------------------------------------------
// 3. SANITIZATION & VALIDATION
// ----------------------------------------------------------------------------
$errors = [];

// Name
$name = trim($data['name'] ?? '');
$name = strip_tags($name);
if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    $errors['name'] = 'Please enter your name or brand (2 to 100 characters).';
}

// WhatsApp Number or Email
$contactInfo = trim($data['contact_info'] ?? ($data['email'] ?? ''));
$contactInfo = strip_tags($contactInfo);
if (mb_strlen($contactInfo) < 3 || mb_strlen($contactInfo) > 150) {
    $errors['contact_info'] = 'Please provide a valid WhatsApp number or Email address.';
}
$email = $contactInfo; // Store in email column for database compatibility

// Service Pillar
$service = trim($data['service'] ?? 'Direct Inquiry / Fast Message');
$service = strip_tags($service);
if (mb_strlen($service) > 100) {
    $service = mb_substr($service, 0, 100);
}

// Budget Tier
$budget = trim($data['budget'] ?? 'Direct Inquiry');
$budget = strip_tags($budget);
if (mb_strlen($budget) > 50) {
    $budget = mb_substr($budget, 0, 50);
}

// Message / Project Scope
$message = trim($data['message'] ?? '');
$message = strip_tags($message);
if (mb_strlen($message) < 5) {
    $errors['message'] = 'Please provide a brief message (minimum 5 characters).';
} elseif (mb_strlen($message) > 5000) {
    $errors['message'] = 'Message is too long (maximum 5000 characters).';
}

// Return validation errors if any
if (!empty($errors)) {
    sendJsonResponse(false, 'Validation failed. Please check your contact information and message.', ['errors' => $errors], 422);
}

// ----------------------------------------------------------------------------
// 4. CLIENT METADATA (IP & User Agent)
// ----------------------------------------------------------------------------
$ipAddress = $_SERVER['HTTP_CF_CONNECTING_IP'] 
    ?? $_SERVER['HTTP_X_FORWARDED_FOR'] 
    ?? $_SERVER['REMOTE_ADDR'] 
    ?? 'UNKNOWN';

if (strpos($ipAddress, ',') !== false) {
    $ipParts = explode(',', $ipAddress);
    $ipAddress = trim($ipParts[0]);
}
$ipAddress = filter_var($ipAddress, FILTER_VALIDATE_IP) ? $ipAddress : 'UNKNOWN';

$userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN', 0, 255);

// ----------------------------------------------------------------------------
// 5. DATABASE PERSISTENCE (PDO Prepared Statement)
// ----------------------------------------------------------------------------
try {
    $pdo = getDBConnection();

    $sql = "INSERT INTO `contacts` (`name`, `email`, `service`, `budget`, `message`, `ip_address`, `user_agent`, `status`, `created_at`) 
            VALUES (:name, :email, :service, :budget, :message, :ip, :ua, 'new', NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':service' => $service,
        ':budget'  => $budget,
        ':message' => $message,
        ':ip'      => $ipAddress,
        ':ua'      => $userAgent
    ]);

    $submissionId = (int)$pdo->lastInsertId();

    // ------------------------------------------------------------------------
    // 6. OPTIONAL EMAIL ALERT NOTIFICATION
    // ------------------------------------------------------------------------
    if (defined('ENABLE_EMAIL_ALERTS') && ENABLE_EMAIL_ALERTS && defined('ADMIN_EMAIL') && !empty(ADMIN_EMAIL)) {
        $subject = "⚡ New Portfolio Lead: " . htmlspecialchars($name) . " [" . htmlspecialchars($service) . "]";
        $emailBody = "<html><body style='font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;'>";
        $emailBody .= "<h2 style='color: #00FF66; border-bottom: 2px solid #FF007F; padding-bottom: 8px;'>⚡ NEW PROJECT TRANSMISSION</h2>";
        $emailBody .= "<p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>";
        $emailBody .= "<p><strong>Email:</strong> <a href='mailto:" . htmlspecialchars($email) . "' style='color: #00F0FF;'>" . htmlspecialchars($email) . "</a></p>";
        $emailBody .= "<p><strong>Pillar:</strong> " . htmlspecialchars($service) . "</p>";
        $emailBody .= "<p><strong>Budget Tier:</strong> " . htmlspecialchars($budget) . "</p>";
        $emailBody .= "<p><strong>Submission ID:</strong> #" . $submissionId . "</p>";
        $emailBody .= "<hr style='border: 1px solid #333333;' />";
        $emailBody .= "<h3>Project Brief:</h3>";
        $emailBody .= "<p style='background-color: #1a1a1a; padding: 15px; border-left: 4px solid #00FF66;'>" . nl2br(htmlspecialchars($message)) . "</p>";
        $emailBody .= "<p style='font-size: 11px; color: #888888;'>IP: " . htmlspecialchars($ipAddress) . " | Sent from Portfolio Contact Form</p>";
        $emailBody .= "</body></html>";

        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: Portfolio Bot <no-reply@' . ($_SERVER['SERVER_NAME'] ?? 'localhost') . '>',
            'Reply-To: ' . $email,
            'X-Mailer: PHP/' . phpversion()
        ];

        @mail(ADMIN_EMAIL, $subject, $emailBody, implode("\r\n", $headers));
    }

    sendJsonResponse(true, "⚡ TRANSMISSION CONFIRMED // Brief locked in. I'll hit you back within 24 hours.", [
        'id'        => $submissionId,
        'name'      => $name,
        'timestamp' => date('c')
    ], 200);

} catch (PDOException $e) {
    error_log('[Submit Contact Error] ' . $e->getMessage());
    sendJsonResponse(false, 'Unable to store project transmission at this moment. Please email directly or try again.', [], 500);
} catch (Exception $e) {
    error_log('[Submit Contact General Error] ' . $e->getMessage());
    sendJsonResponse(false, 'An unexpected server anomaly occurred.', [], 500);
}
