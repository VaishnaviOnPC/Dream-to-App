// Simple test for Gemini API
import { parseWithGemini } from './geminiParser.js';

export async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');

  try {
    const result = await parseWithGemini("I want to learn lucid dreaming");
    console.log('✅ Gemini test successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    return null;
  }
}

// Direct API key test - EXACT copy of working terminal test
export async function testDirectAPI() {
  console.log('🔍 DIRECT API KEY TEST - Browser version of working terminal test');
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  console.log('🔑 Using API key:', API_KEY.substring(0, 15) + '...');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: "Say hello"
      }]
    }]
  };
  
  try {
    console.log('📡 Making request to:', url.split('?')[0]);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      const text = await response.text();
      console.log('📊 Raw response:', text);
      return null;
    }
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('📝 Response:', JSON.stringify(data, null, 2));
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log('🎉 Generated text:', data.candidates[0].content.parts[0].text);
      }
      return data;
    } else {
      console.log('❌ FAILED');
      console.log('🚨 Error response:', JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.log('💥 Error message:', data.error.message);
        console.log('💥 Error code:', data.error.code);
        console.log('💥 Error status:', data.error.status);
      }
      return null;
    }
    
  } catch (error) {
    console.log('❌ REQUEST ERROR');
    console.log('💥 Error name:', error.name);
    console.log('💥 Error message:', error.message);
    console.log('💥 Error stack:', error.stack);
    
    // Check for specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('🔍 This looks like a network/CORS error');
    }
    
    return null;
  }
}

// Test with a simple request using the official Google Generative AI library
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function testSimpleGemini() {
  // Use the EXACT same approach as parseWithGemini
  console.log('🔧 Testing Gemini in browser environment...');

  // Debug environment
  console.log('🔍 Environment Debug:');
  console.log('- import.meta.env:', import.meta.env);
  console.log('- VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  console.log('- API key value:', import.meta.env.VITE_GEMINI_API_KEY?.substring(0, 15) + '...');

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.error('❌ No valid API key found in environment');
    console.log('💡 Make sure .env file has VITE_GEMINI_API_KEY and dev server is restarted');
    return false;
  }

  try {
    console.log('🚀 Initializing GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ GoogleGenerativeAI client created');

    console.log('🔄 Testing gemini-2.0-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Model instance created');

    console.log('📝 Sending test prompt...');
    const result = await model.generateContent('Say hello in one word');
    console.log('📡 Request completed');

    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS! Gemini response:', text);
    return true;

  } catch (error) {
    console.error('❌ Gemini test failed:');
    console.error('- Error name:', error.name);
    console.error('- Error message:', error.message);
    console.error('- Full error:', error);

    // Check for common issues
    if (error.message.includes('404')) {
      console.log('💡 Model not found - trying different model name');
    } else if (error.message.includes('403')) {
      console.log('💡 API key permission issue - check if key is valid');
    } else if (error.message.includes('fetch')) {
      console.log('💡 Network issue - check internet connection');
    }

    return false;
  }
}