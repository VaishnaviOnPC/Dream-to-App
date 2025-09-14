import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Zap, Brain, Moon, Sun } from 'lucide-react';
import { parseDream } from '../dreamParser';
import { testSimpleGemini } from '../testGemini';
import { debugGeminiAPI, validateAPIKey } from '../debugGemini';

export default function DreamGenerator({ onGenerateApp }) {
  const [dreamText, setDreamText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('dream-app-dark-mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('dream-app-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const exampleDreams = [
    // Classic goals
    "I want to run a half marathon in 3 months",
    "I want to learn Spanish fluently in 6 months",
    "I want to write and publish a novel this year",
    "I want to lose 30 pounds and get in the best shape of my life",
    "I want to learn to play guitar and perform at open mic nights",

    // Creative & unique goals
    "I want to become a sourdough bread master",
    "I want to build a treehouse for my kids",
    "I want to learn to juggle and perform at parties",
    "I want to grow a vegetable garden and be self-sufficient",
    "I want to learn beatboxing and join a band",
    "I want to master origami and teach others",
    "I want to learn calligraphy and create beautiful art",
    "I want to build a tiny house and live off-grid",
    "I want to learn magic tricks and amaze my friends",

    // Business & career
    "I want to start a YouTube channel and get 10k subscribers",
    "I want to become a certified scuba diving instructor",
    "I want to learn day trading and make consistent profits",
    "I want to start a food truck business",
    "I want to become a freelance graphic designer",
    "I want to launch my own podcast and get 1000 listeners",

    // Personal development
    "I want to overcome my fear of public speaking",
    "I want to become minimalist and declutter my life",
    "I want to learn to lucid dream consistently",
    "I want to meditate daily and find inner peace",
    "I want to read 52 books this year",
    "I want to wake up at 5 AM every day and be more productive",

    // Fitness & health
    "I want to do 100 push-ups in a row",
    "I want to learn rock climbing and conquer my first mountain",
    "I want to complete a triathlon",
    "I want to learn martial arts and earn a black belt",

    // Social & relationships
    "I want to make 5 new genuine friendships this year",
    "I want to reconnect with old friends and strengthen bonds",
    "I want to improve my dating life and find a meaningful relationship",
    "I want to become a better parent and spend quality time with my kids",

    // Adventure & travel
    "I want to visit 10 new countries this year",
    "I want to learn survival skills and go camping alone",
    "I want to hike the entire Appalachian Trail",

    // Skills & hobbies
    "I want to learn photography and build a stunning portfolio",
    "I want to master chess and compete in tournaments",
    "I want to become a wine connoisseur and sommelier"
  ];

  const handleGenerate = async () => {
    if (!dreamText.trim()) return;

    setIsGenerating(true);

    try {
      const spec = await parseDream(dreamText, useAI);

      // Check if AI was supposed to be used but failed (indicated by generic fallback)
      if (useAI && spec.category === 'general' && spec.title === dreamText) {
        console.log('⚠️ AI parsing may have failed, using rule-based result');
      }

      onGenerateApp(spec);
    } catch (error) {
      console.error('Failed to generate app:', error);
      // Fallback to rule-based parsing
      const spec = await parseDream(dreamText, false);
      onGenerateApp(spec);
    }

    setIsGenerating(false);
  };

  const handleExampleClick = (example) => {
    setDreamText(example);
  };

  const testAPI = async () => {
    console.log('🧪 Testing Gemini with config file approach...');
    
    try {
      // Import config
      const { config } = await import('../config.js');
      console.log('✅ Config loaded, API key exists:', !!config.GEMINI_API_KEY);
      
      // Import Gemini
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      console.log('✅ GoogleGenerativeAI imported');
      
      // Create client
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      console.log('✅ Client created');
      
      // Get model
      const model = genAI.getGenerativeModel({ model: config.GEMINI_MODEL });
      console.log('✅ Model obtained');
      
      // Generate content
      const result = await model.generateContent('Say hello world');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ SUCCESS! Response:', text);
      alert('🎉 Gemini API is working! Response: ' + text);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      alert('❌ Test failed: ' + error.message);
    }
  };

  const testDirectAPI = async () => {
    console.log('🔍 Testing DIRECT API call...');
    
    // First, check if environment variable is loaded
    console.log('🔧 Environment check:');
    console.log('- import.meta.env exists:', !!import.meta.env);
    console.log('- VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
    console.log('- API key length:', import.meta.env.VITE_GEMINI_API_KEY?.length || 0);
    console.log('- API key format:', import.meta.env.VITE_GEMINI_API_KEY?.startsWith('AIza') ? 'Valid' : 'Invalid');
    
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      alert('❌ No API key found in environment variables. Make sure .env file exists and dev server is restarted.');
      return;
    }
    
    try {
      const { testDirectAPI } = await import('../testGemini.js');
      const result = await testDirectAPI();
      
      if (result) {
        alert('✅ Direct API test successful! Check console for details.');
      } else {
        alert('❌ Direct API test failed. Check console for error details.');
      }
    } catch (error) {
      console.error('❌ Direct test failed:', error);
      alert('❌ Direct test error: ' + error.message);
    }
  };

  const debugAPI = async () => {
    console.log('🔍 Running comprehensive Gemini debug...');

    // First validate API key format
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const validation = validateAPIKey(apiKey);

    console.log('🔑 API Key validation:', validation);

    if (!validation.valid) {
      alert(`❌ API Key Issue: ${validation.reason}\n\nGet a valid key from: https://aistudio.google.com/app/apikey`);
      return;
    }

    // Run comprehensive debug
    const result = await debugGeminiAPI();

    if (result) {
      alert('✅ Gemini API is working perfectly!');
    } else {
      alert('❌ Gemini API debug failed. Check console for detailed error analysis.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-purple-50 to-blue-50'
    }`}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 relative">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`absolute top-0 right-0 p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
              darkMode 
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 shadow-lg shadow-yellow-500/20' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30' 
              : 'bg-purple-100'
          }`}>
            <Sparkles className={`${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} size={32} />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${
            darkMode 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' 
              : 'text-gray-900'
          }`}>Dream-to-App</h1>
          <p className={`text-xl ${
            darkMode ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Turn any goal into a personalized tracking app
          </p>
        </div>

        <div className={`rounded-2xl shadow-2xl p-8 transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 shadow-purple-500/20' 
            : 'bg-white shadow-xl'
        }`}>
          {/* AI Toggle */}
          <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-sm border border-slate-600/50' 
              : 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Brain className={`${
                  darkMode ? 'text-cyan-400' : 'text-blue-600'
                }`} size={20} />
                <span className={`font-semibold ${
                  darkMode ? 'text-slate-100' : 'text-gray-800'
                }`}>Gemini AI Enhancement</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  darkMode 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                    : 'bg-green-100 text-green-700'
                }`}>Optional</span>
              </div>
              <button
                onClick={() => setUseAI(!useAI)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useAI ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAI ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
            <p className={`text-sm ${
              darkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {useAI
                ? "🧠 AI handles weird/unique goals + creates more creative apps"
                : "⚡ Smart parser works instantly for 90% of goals (no API needed!)"
              }
            </p>
            {useAI && (
              <div className="mt-2 flex flex-wrap gap-2">
                {!import.meta.env.VITE_GEMINI_API_KEY && (
                  <button
                    onClick={() => setShowApiSetup(!showApiSetup)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Setup API key
                  </button>
                )}
                <button
                  onClick={testAPI}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  Quick Test
                </button>
                <button
                  onClick={debugAPI}
                  className="text-xs text-orange-600 hover:text-orange-800 underline"
                >
                  Debug API
                </button>
                <span className="text-xs text-gray-500">
                  (Falls back to smart parser if API fails)
                </span>
              </div>
            )}
          </div>

          {/* API Setup Instructions */}
          {showApiSetup && (
            <div className={`mb-6 p-4 rounded-lg border ${
              darkMode 
                ? 'bg-yellow-900/20 border-yellow-600/30 text-yellow-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                darkMode ? 'text-yellow-300' : 'text-yellow-800'
              }`}>🔑 Gemini API Setup</h4>
              <ol className={`text-sm space-y-1 list-decimal list-inside ${
                darkMode ? 'text-yellow-200' : 'text-yellow-700'
              }`}>
                <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                <li>Create a free API key</li>
                <li>Create a <code>.env</code> file in your project root</li>
                <li>Add: <code>VITE_GEMINI_API_KEY=your-api-key-here</code></li>
                <li>Restart the dev server</li>
              </ol>
              <p className={`text-xs mt-2 ${
                darkMode ? 'text-yellow-300' : 'text-yellow-600'
              }`}>
                Without API key, it will fall back to basic parsing (still works for common goals!)
              </p>
              
              {/* Test Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={testDirectAPI}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    darkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  🔍 Test Direct API
                </button>
                <button
                  onClick={testAPI}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  🧪 Test Config API
                </button>
                <button
                  onClick={debugAPI}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  🔧 Debug API
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="dream" className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-slate-200' : 'text-gray-700'
            }`}>
              What's your dream or goal?
            </label>
            <textarea
              id="dream"
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder={useAI
                ? "Describe ANY goal in plain English - AI will understand it! Try something unique..."
                : "Describe your goal (fitness, learning, writing, business, health, creative)..."
              }
              className={`w-full h-32 px-4 py-3 rounded-lg resize-none text-lg transition-all duration-200 ${
                darkMode 
                  ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                  : 'border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              }`}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!dreamText.trim() || isGenerating}
            className={`w-full font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{useAI ? '🧠 AI is analyzing your dream...' : '📝 Generating your app...'}</span>
              </>
            ) : (
              <>
                <span>{useAI ? '✨ Generate with AI' : '📝 Generate App'}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="mt-8">
            <div className="flex items-center mb-4">
              <Lightbulb className={`mr-2 ${
                darkMode ? 'text-yellow-400' : 'text-yellow-500'
              }`} size={20} />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-slate-200' : 'text-gray-700'
              }`}>Try these examples:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {exampleDreams.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className={`text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 transform hover:scale-102 ${
                    darkMode 
                      ? 'text-slate-300 bg-slate-700/50 backdrop-blur-sm border border-slate-600/30 hover:bg-slate-600/50 hover:border-purple-400/50' 
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  "{example}"
                </button>
              ))}
            </div>

            <div className={`mt-6 p-4 rounded-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-sm border border-slate-600/50' 
                : 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200'
            }`}>
              <h4 className={`text-sm font-semibold mb-2 ${
                darkMode ? 'text-emerald-300' : 'text-green-800'
              }`}>
                {useAI ? "🧠 AI Enhancement - handles weird goals:" : "⚡ Smart Parser - works instantly:"}
              </h4>
              {useAI ? (
                <div className={`text-xs space-y-1 ${
                  darkMode ? 'text-emerald-200' : 'text-green-700'
                }`}>
                  <div>🤖 <strong>Unlimited creativity:</strong> "train my parrot to speak Shakespeare"</div>
                  <div>🎭 <strong>Unusual hobbies:</strong> "become a professional whistler"</div>
                  <div>🌟 <strong>Unique combinations:</strong> "learn underwater basket weaving"</div>
                  <div className={`font-semibold mt-2 ${
                    darkMode ? 'text-emerald-300' : 'text-green-800'
                  }`}>For truly weird goals - AI is your friend! 🤖</div>
                </div>
              ) : (
                <div className={`text-xs space-y-1 ${
                  darkMode ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  <div>🏃 <strong>Fitness:</strong> marathons, 100 push-ups, rock climbing, martial arts</div>
                  <div>📚 <strong>Learning:</strong> languages, reading challenges, chess, photography</div>
                  <div>✍️ <strong>Creative:</strong> sourdough baking, magic tricks, calligraphy, tiny houses</div>
                  <div>💼 <strong>Business:</strong> YouTube channels, podcasts, food trucks, freelancing</div>
                  <div>🧘 <strong>Personal:</strong> meditation, travel, lucid dreaming, relationships</div>
                  <div>🎯 <strong>Adventure:</strong> survival skills, hiking trails, world travel</div>
                  <div className={`font-semibold mt-2 ${
                    darkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>40+ specialized goals supported - no API needed! ⚡</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`text-center mt-8 text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-500'
        }`}>
          <p>{useAI ? "Enhanced by AI" : "Smart & Fast"} • Personalized for you • Ready in seconds</p>
        </div>
      </div>
    </div>
  );
}