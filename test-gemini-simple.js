// Simple Gemini API test using Node.js built-in fetch (Node 18+)

async function testGemini() {
  console.log('🔍 SIMPLE GEMINI API TEST');
  console.log('=' .repeat(40));
  
  // API key from .env file
  const API_KEY = 'AIzaSyBLLI7tf8ueY2n1Wj4wNV9xtVwnNtvh2tY';
  
  console.log('🔑 Testing with API key:', API_KEY.substring(0, 15) + '...');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: "Say hello"
      }]
    }]
  };
  
  try {
    console.log('📡 Making request...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📊 Status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('📝 Response:', JSON.stringify(data, null, 2));
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log('🎉 Generated text:', data.candidates[0].content.parts[0].text);
      }
    } else {
      console.log('❌ FAILED');
      console.log('🚨 Error response:', JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.log('💥 Error message:', data.error.message);
        console.log('💥 Error code:', data.error.code);
      }
    }
    
  } catch (error) {
    console.log('❌ REQUEST ERROR');
    console.log('💥 Error:', error.message);
  }
}

// Run the test
testGemini();