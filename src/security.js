// Security utilities for Dream-to-App

// Input sanitization
export function sanitizeUserInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potential XSS and injection attempts
  return input
    .replace(/[<>\"'`]/g, '') // Remove HTML/JS injection chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .substring(0, 1000) // Limit length
    .trim();
}

// API key validation
export function validateAPIKey(apiKey) {
  if (!apiKey) return { valid: false, reason: 'No API key provided' };
  if (apiKey === 'your-gemini-api-key-here') return { valid: false, reason: 'Placeholder API key' };
  if (apiKey.length < 20) return { valid: false, reason: 'API key too short' };
  if (!apiKey.startsWith('AIza')) return { valid: false, reason: 'Invalid API key format' };
  
  return { valid: true, reason: 'API key format looks correct' };
}

// Safe logging - never log sensitive data
export function safeLog(message, data = null) {
  if (data && typeof data === 'object') {
    // Remove sensitive fields before logging
    const safeCopy = { ...data };
    delete safeCopy.apiKey;
    delete safeCopy.key;
    delete safeCopy.token;
    delete safeCopy.password;
    
    console.log(message, safeCopy);
  } else {
    console.log(message, data);
  }
}

// Rate limiting for API calls
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  canMakeRequest() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

export const geminiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

// Content filtering for AI responses
export function filterAIResponse(response) {
  if (!response || typeof response !== 'string') {
    return '';
  }
  
  // Remove potentially harmful content
  return response
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:text\/html/gi, '') // Remove data URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit response length
}

// Environment checks
export function checkSecurityConfig() {
  const issues = [];
  
  // Check if running in development
  if (import.meta.env.DEV) {
    issues.push('Running in development mode - extra logging enabled');
  }
  
  // Check if API key is exposed
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your-gemini-api-key-here') {
    if (apiKey.length < 30) {
      issues.push('API key appears to be invalid or test key');
    }
  }
  
  return {
    secure: issues.length === 0,
    issues
  };
}