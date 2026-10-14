/**
 * Input sanitization & security validation utilities
 * Protects against XSS, script injection, and malicious input patterns.
 */

// Strip HTML tags and dangerous characters
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // strip opening/closing angle brackets
    .trim();
}

// Sanitize telephone numbers (digits, +, -, space, brackets)
export function sanitizePhone(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[^\d+()-\s]/g, '').trim().slice(0, 20);
}

// Basic email validation
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Generates a mock CSRF token for frontend form sessions
export function getCsrfToken() {
  const tokenKey = '_aa_csrf_token';
  let token = sessionStorage.getItem(tokenKey);
  if (!token) {
    token = 'csrf_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem(tokenKey, token);
  }
  return token;
}

// Simple rate limiter for client-side submissions (prevents rapid spam)
const submissionsLog = [];
export function checkRateLimit(maxAttempts = 3, windowMs = 60000) {
  const now = Date.now();
  // Filter submissions inside the window
  const recent = submissionsLog.filter((time) => now - time < windowMs);
  submissionsLog.length = 0;
  submissionsLog.push(...recent);
  if (submissionsLog.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  submissionsLog.push(now);
  return true;
}

