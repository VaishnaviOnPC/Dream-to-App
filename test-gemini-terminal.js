#!/usr/bin/env node

// Terminal test for Gemini API - bypasses all browser issues
import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();

async function testGeminiTerminal() {
  console.log('🔍 TERMINAL GEMINI API TEST');
  console.log('=' .repeat(50));
  
  // Get API key from environment
  const API_KEY = process.env.VITE_GEMINI_API_KEY || 'AIzaSyBLLI7tf8ueY2n1Wj4wNV9xtVwnNtvh2tY';
  
  console.log('🔑 API Key:', API_KEY ? API_KEY.substring(0, 15) + '...' : 'NOT FOUND');
  
  if (!API_KEY) {
    console.error('❌ No API key found!');
    console.log('💡 Make sure .env file has VITE_GEMINI_API_KEY');
    return;
  }
  
  // Test URL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  // Test payload
  const payload = {
    contents: [{
      parts: [{
        text: "Say hello in one word"
      }]
    }]
  };
  
  console.log('📡 Making request to:', url.split('?')[0]);
  console.log('📝 Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ SUCCESS! Gemini API is working!');
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        console.log('🎉 Generated text:', text);
      }
    } else {
      console.error('❌ API request failed');
      if (data.error) {
        console.error('🚨 Error details:', data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Network/Request error:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Run the test
testGeminiTerminal().catch(console.error);