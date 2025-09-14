// Configuration file for API keys and settings
// This bypasses Vite's environment variable issues

export const config = {
  // Gemini API key - replace with your actual key
  GEMINI_API_KEY: 'AIzaSyBLLI7tf8ueY2n1Wj4wNV9xtVwnNtvh2tY',
  
  // Other settings
  GEMINI_MODEL: 'gemini-1.5-flash',
  RATE_LIMIT: 10, // requests per minute
};