// Comprehensive Gemini API debugging using official Google Generative AI library
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function debugGeminiAPI() {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('🔍 === GEMINI API DEBUG ===');
  console.log('🔑 API Key exists:', !!GEMINI_API_KEY);
  console.log('🔑 API Key configured:', GEMINI_API_KEY ? 'Yes' : 'No');
  console.log('🔑 API Key format:', GEMINI_API_KEY?.startsWith('AIza') ? 'Valid format' : 'Invalid format');
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 20) {
    console.error('❌ Invalid or missing API key');
    return false;
  }
  
  // Test different endpoints and models (updated to working models)
  const tests = [
    {
      name: 'Gemini 1.5 Flash',
      model: 'gemini-1.5-flash'
    },
    {
      name: 'Gemini 1.5 Pro', 
      model: 'gemini-1.5-pro'
    },
    {
      name: 'Gemini 1.0 Pro',
      model: 'gemini-1.0-pro'
    }
  ];
  
  try {
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Google Generative AI client initialized');
    
    for (const test of tests) {
      console.log(`\n🧪 Testing: ${test.name}`);
      
      try {
        console.log('📡 Testing model with official SDK:', test.model);
        
        // Get the model using the official SDK
        const model = genAI.getGenerativeModel({ model: test.model });
        
        console.log('📦 Sending test request...');
        
        // Test with a simple prompt
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: "Hello, respond with just 'Hi'" }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        });
        
        const response = await result.response;
        const text = response.text();
        
        console.log('📊 Response received successfully');
        console.log('📄 Response text:', text);
        
        if (text && text.trim()) {
          console.log('🎉 SUCCESS! Gemini is working with', test.name);
          return true;
        } else {
          console.log('⚠️ Empty response from', test.name);
        }
        
      } catch (error) {
        console.error(`❌ Error testing ${test.name}:`, error.message);
        
        // Check for common errors
        if (error.message.includes('404')) {
          console.log('💡 Tip: The model might not exist or be available in your region');
        } else if (error.message.includes('403')) {
          console.log('💡 Tip: Check if your API key has the right permissions');
        } else if (error.message.includes('400')) {
          console.log('💡 Tip: Check if the model name is correct and available');
        }
      }
    }
    
  } catch (initError) {
    console.error('❌ Failed to initialize Google Generative AI:', initError.message);
    console.log('💡 Tip: Check if your API key is valid and properly formatted');
  }
  
  console.log('\n❌ All tests failed. Common issues:');
  console.log('1. Invalid API key - get a new one from https://aistudio.google.com/app/apikey');
  console.log('2. API not enabled - make sure Gemini API is enabled in your Google Cloud project');
  console.log('3. Regional restrictions - Gemini might not be available in your region');
  console.log('4. Model availability - some models might be experimental or unavailable');
  
  return false;
}

// Quick API key validation
export function validateAPIKey(apiKey) {
  if (!apiKey) return { valid: false, reason: 'No API key provided' };
  if (apiKey === 'your-gemini-api-key-here') return { valid: false, reason: 'Placeholder API key' };
  if (apiKey.length < 20) return { valid: false, reason: 'API key too short' };
  if (!apiKey.startsWith('AIza')) return { valid: false, reason: 'Invalid API key format (should start with AIza)' };
  
  return { valid: true, reason: 'API key format looks correct' };
}