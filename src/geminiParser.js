// Gemini integration using config file (bypasses env variable issues)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeUserInput, geminiRateLimiter, filterAIResponse } from './security.js';
import { config } from './config.js';

export async function parseWithGemini(dreamText) {
    console.log('🔧 Gemini parsing - simplified approach...');

    // Debug environment access
    console.log('🔍 Gemini Parser Environment Debug:');
    console.log('- import.meta.env exists:', !!import.meta.env);
    console.log('- Direct env access:', !!import.meta.env?.VITE_GEMINI_API_KEY);
    console.log('- Config object:', config);
    console.log('- Config API key exists:', !!config.GEMINI_API_KEY);

    // Get API key from config (bypasses env variable issues)
    const GEMINI_API_KEY = config.GEMINI_API_KEY;
    console.log('🔑 API key loaded from config:', !!GEMINI_API_KEY);
    console.log('🔑 API key type:', typeof GEMINI_API_KEY);
    console.log('🔑 API key length:', GEMINI_API_KEY?.length || 0);
    console.log('🔑 API key starts with AIza:', GEMINI_API_KEY?.startsWith?.('AIza') || false);

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('⚠️ No Gemini API key configured - falling back to rule-based parser');
        console.log('💡 To enable AI: Get key from https://aistudio.google.com/app/apikey');
        console.log('💡 Current value:', GEMINI_API_KEY);
        return null;
    }

    // Sanitize input
    const sanitizedInput = sanitizeUserInput(dreamText);
    if (!sanitizedInput) {
        console.log('❌ Invalid input');
        return null;
    }

    try {
        console.log('🚀 Creating Gemini client...');
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        console.log('📱 Getting model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        console.log('📝 Sending request...');

        // Create the prompt
        const prompt = `
You are an expert goal-setting coach. Parse this dream/goal into a structured JSON format for a goal-tracking app:

"${sanitizedInput}"

Return ONLY a valid JSON object with this EXACT structure (no markdown, no explanations):

{
  "title": "Short, motivating title (max 50 chars)",
  "duration": "Extracted or reasonable timeframe (e.g., '3 months', '6 weeks')",
  "category": "One of: fitness, learning, writing, business, health, creative, career, financial, social, personal",
  "target": "Specific measurable target description",
  "milestones": [
    {
      "week": 2,
      "title": "Milestone name",
      "description": "What to accomplish in this phase",
      "target": "Specific measurable target for this milestone"
    }
  ],
  "trackers": [
    {
      "name": "Tracker name",
      "type": "counter|number|percentage",
      "unit": "Optional unit (miles, hours, words, $, etc.)",
      "target": 100
    }
  ],
  "motivation": [
    "5 personalized motivational messages specific to this goal with relevant emojis"
  ]
}

Guidelines:
- Extract realistic timeline from text, default to 3 months if unclear
- Create 3-5 progressive milestones spread across timeline
- Include 2-4 relevant tracking metrics that make sense for the goal
- Make motivation messages specific and encouraging for this exact goal
- Be creative but realistic with targets
- If it's a vague goal, make reasonable assumptions and structure it
- Handle ANY type of goal, even unusual ones
`;

        const result = await model.generateContent(prompt);
        console.log('📡 Got result...');

        const response = await result.response;
        console.log('📄 Got response...');

        const content = response.text();
        console.log('✅ Got content, length:', content.length);

        // Filter AI response for security
        const filteredContent = filterAIResponse(content);

        // Clean up the response to ensure it's valid JSON
        let jsonText = filteredContent;

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Find JSON object in the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in Gemini response');
        }

        const parsedSpec = JSON.parse(jsonMatch[0]);

        // Add gamification based on category
        parsedSpec.gamification = {
            streaks: true,
            xpPerAction: getXPForCategory(parsedSpec.category),
            badges: generateBadgesForCategory(parsedSpec.category, parsedSpec.title)
        };

        // Validate and fix the spec
        const finalSpec = validateAndFixSpec(parsedSpec);

        console.log('🎉 Successfully parsed with Gemini:', finalSpec.title);
        return finalSpec;

    } catch (error) {
        console.error('❌ Gemini parsing failed:');
        console.error('- Error name:', error.name);
        console.error('- Error message:', error.message);
        console.error('- Full error:', error);

        // Check for common issues (same as working test)
        if (error.message.includes('404')) {
            console.log('💡 Model not found - trying different model name');
        } else if (error.message.includes('403')) {
            console.log('💡 API key permission issue - check if key is valid');
        } else if (error.message.includes('fetch')) {
            console.log('💡 Network issue - check internet connection');
        }

        throw error;
    }
}

function getXPForCategory(category) {
    const xpMap = {
        fitness: 10,
        learning: 5,
        writing: 1,
        business: 50,
        health: 25,
        creative: 15,
        career: 30,
        financial: 40,
        social: 20,
        personal: 15
    };
    return xpMap[category] || 20;
}

function generateBadgesForCategory(category, title) {
    const badgeMap = {
        fitness: ['First Workout', 'Consistency Champion', 'Fitness Master'],
        learning: ['Knowledge Seeker', 'Study Streak', 'Learning Legend'],
        writing: ['Word Warrior', 'Chapter Champion', 'Published Author'],
        business: ['Entrepreneur', 'First Sale', 'Business Builder'],
        health: ['Healthy Start', 'Wellness Warrior', 'Lifestyle Legend'],
        creative: ['Creative Spark', 'Artistic Flow', 'Masterpiece Maker'],
        career: ['Career Climber', 'Skill Builder', 'Professional Pro'],
        financial: ['Money Manager', 'Savings Star', 'Financial Freedom'],
        social: ['Social Butterfly', 'Connection Creator', 'Relationship Builder'],
        personal: ['Self Improver', 'Growth Guru', 'Personal Champion']
    };

    let badges = badgeMap[category] || ['Goal Getter', 'Progress Pro', 'Achievement Unlocked'];

    // Personalize first badge based on title
    if (title) {
        const words = title.toLowerCase().split(' ');
        if (words.includes('learn')) badges[0] = 'Learning Starter';
        if (words.includes('build')) badges[0] = 'Builder Beginner';
        if (words.includes('create')) badges[0] = 'Creative Starter';
        if (words.includes('master')) badges[0] = 'Mastery Seeker';
    }

    return badges;
}

function validateAndFixSpec(spec) {
    // Ensure required fields exist
    if (!spec.title) spec.title = 'My Goal';
    if (!spec.duration) spec.duration = '3 months';
    if (!spec.category) spec.category = 'personal';
    if (!spec.target) spec.target = 'Complete goal';
    if (!spec.milestones || !Array.isArray(spec.milestones)) {
        spec.milestones = [
            { week: 2, title: 'Getting Started', description: 'Build initial momentum', target: '25% progress' },
            { week: 6, title: 'Halfway Point', description: 'Maintain consistency', target: '50% progress' },
            { week: 10, title: 'Final Push', description: 'Complete the goal', target: '100% progress' }
        ];
    }
    if (!spec.trackers || !Array.isArray(spec.trackers)) {
        spec.trackers = [
            { name: 'Progress', type: 'percentage', target: 100 },
            { name: 'Days Active', type: 'counter', target: 60 }
        ];
    }
    if (!spec.motivation || !Array.isArray(spec.motivation)) {
        spec.motivation = [
            "You're making great progress! 🌟",
            "Every step forward counts",
            "Consistency is the key to success",
            "Believe in yourself - you've got this!",
            "Your future self will thank you"
        ];
    }

    // Ensure trackers have valid targets
    spec.trackers.forEach(tracker => {
        if (!tracker.target || tracker.target <= 0) {
            tracker.target = tracker.type === 'percentage' ? 100 : 50;
        }
    });

    // Ensure milestones have valid week numbers
    spec.milestones.forEach((milestone, index) => {
        if (!milestone.week || milestone.week <= 0) {
            milestone.week = (index + 1) * 2;
        }
    });

    return spec;
}