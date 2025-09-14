// Dream Parser - Converts natural language goals into structured app specs
import { parseWithGemini } from './geminiParser.js';

export async function parseDream(dreamText, useAI = true) {
  console.log('🎯 Parsing dream:', dreamText);
  console.log('🤖 Use AI:', useAI);
  console.log('🔑 API Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  
  // Try Gemini first if enabled
  if (useAI) {
    try {
      console.log('🚀 Attempting Gemini parsing...');
      const geminiResult = await parseWithGemini(dreamText);
      if (geminiResult) {
        console.log('✨ Successfully parsed with Gemini AI:', geminiResult.title);
        return geminiResult;
      }
    } catch (error) {
      console.error('❌ Gemini parsing failed:', error);
    }
  }
  
  console.log('📝 Using enhanced rule-based parser as fallback');
  const result = parseWithRules(dreamText);
  console.log('📊 Generated spec:', result);
  return result;
}

function parseWithRules(dreamText) {
  const dream = dreamText.toLowerCase().trim();

  // Enhanced timeline extraction
  const timePatterns = [
    { pattern: /(\d+)\s*months?/i, multiplier: 30 },
    { pattern: /(\d+)\s*weeks?/i, multiplier: 7 },
    { pattern: /(\d+)\s*days?/i, multiplier: 1 },
    { pattern: /(\d+)\s*years?/i, multiplier: 365 },
    { pattern: /half\s*year|6\s*months/i, days: 180, text: "6 months" },
    { pattern: /quarter|3\s*months/i, days: 90, text: "3 months" }
  ];

  let duration = 90; // default 3 months
  let timeframe = "3 months";

  for (const { pattern, multiplier, days, text } of timePatterns) {
    const match = dream.match(pattern);
    if (match) {
      if (days) {
        duration = days;
        timeframe = text;
      } else {
        duration = parseInt(match[1]) * multiplier;
        timeframe = match[0];
      }
      break;
    }
  }

  // Specific goal detection first (high priority matches)
  const specificGoals = {
    // Creative & Unique Goals
    sourdough: ['sourdough', 'bread baking', 'bread making', 'sourdough bread master'],
    treehouse: ['treehouse', 'tree house', 'build a treehouse'],
    juggling: ['juggle', 'juggling', 'perform at parties'],
    vegetable_garden: ['vegetable garden', 'grow vegetables', 'self-sufficient', 'grow a vegetable garden'],
    beatboxing: ['beatbox', 'beatboxing', 'beat box', 'join a band'],
    origami: ['origami', 'paper folding', 'teach others'],
    
    // Business & Career
    youtube: ['youtube', 'youtube channel', 'subscribers', '10k subscribers'],
    scuba: ['scuba', 'diving instructor', 'underwater', 'certified scuba diving instructor'],
    day_trading: ['day trading', 'trading', 'stocks', 'forex', 'consistent profits'],
    
    // Personal Development
    public_speaking: ['public speaking', 'fear of speaking', 'presentation', 'overcome my fear of public speaking'],
    minimalism: ['minimalist', 'declutter', 'minimalism', 'become minimalist'],
    lucid_dreaming: ['lucid dream', 'lucid dreaming', 'consistently', 'learn to lucid dream'],
    
    // Social & Relationships
    friendship: ['make friends', 'friendship', 'social connections', 'genuine friendships', '5 new genuine friendships'],
    reconnect_friends: ['reconnect', 'old friends', 'strengthen bonds', 'reconnect with old friends'],
    
    // Skills & hobbies
    photography: ['photography', 'photographer', 'photos', 'stunning portfolio'],
    calligraphy: ['calligraphy', 'beautiful art', 'hand lettering'],
    magic_tricks: ['magic tricks', 'amaze my friends', 'magic', 'magician'],
    chess: ['chess', 'compete in tournaments', 'chess master'],
    wine: ['wine connoisseur', 'sommelier', 'wine tasting', 'wine'],
    
    // Missing goals from examples
    guitar: ['learn to play guitar', 'guitar', 'open mic nights', 'play guitar'],
    weight_loss: ['lose 30 pounds', 'lose weight', 'best shape of my life', 'get in shape'],
    tiny_house: ['tiny house', 'live off-grid', 'off grid', 'build a tiny house'],
    food_truck: ['food truck business', 'food truck'],
    freelance_design: ['freelance graphic designer', 'graphic design', 'freelance'],
    podcast: ['launch my own podcast', 'podcast', '1000 listeners'],
    early_riser: ['wake up at 5 AM', '5 AM', 'more productive'],
    rock_climbing: ['rock climbing', 'conquer my first mountain', 'climbing'],
    triathlon: ['triathlon', 'complete a triathlon'],
    martial_arts: ['martial arts', 'black belt', 'karate', 'judo', 'taekwondo'],
    dating: ['improve my dating life', 'meaningful relationship', 'dating'],
    parenting: ['better parent', 'quality time with my kids', 'parenting'],
    travel: ['visit 10 new countries', 'new countries', 'travel'],
    survival: ['survival skills', 'camping alone', 'wilderness'],
    hiking: ['hike the entire', 'appalachian trail', 'long distance hiking'],
    language_learning: ['learn a new language every', 'new language', 'language every'],
    
    // Fitness & health specific
    pushups: ['100 push-ups', 'push-ups in a row', 'pushups'],
    rock_climbing: ['rock climbing', 'conquer my first mountain', 'climbing'],
    triathlon: ['triathlon', 'complete a triathlon'],
    martial_arts: ['martial arts', 'black belt', 'karate', 'judo', 'taekwondo'],
    
    // Business specific
    food_truck: ['food truck business', 'food truck'],
    freelance_design: ['freelance graphic designer', 'graphic design'],
    podcast: ['launch my own podcast', 'podcast', '1000 listeners'],
    
    // Personal development specific
    meditation: ['meditate daily', 'inner peace', 'meditation'],
    reading: ['read 52 books', 'books this year', 'reading challenge'],
    early_riser: ['wake up at 5 AM', 'more productive', '5 AM'],
    
    // Adventure & travel
    travel: ['visit 10 new countries', 'new countries', 'travel the world'],
    survival: ['survival skills', 'camping alone', 'wilderness'],
    hiking: ['hike the entire', 'appalachian trail', 'long distance hiking'],
    
    // Relationships
    dating: ['improve my dating life', 'meaningful relationship', 'dating'],
    parenting: ['better parent', 'quality time with my kids', 'parenting'],
    
    // Other creative
    tiny_house: ['tiny house', 'live off-grid', 'off grid'],
    cooking: ['cook', 'cooking', 'chef', 'recipe', 'baking', 'culinary'],
    gardening: ['garden', 'gardening', 'grow plants']
  };

  // Check for specific goals first
  let specificMatch = null;
  for (const [goalType, keywords] of Object.entries(specificGoals)) {
    if (keywords.some(keyword => dream.includes(keyword))) {
      specificMatch = goalType;
      break;
    }
  }

  if (specificMatch) {
    console.log('🎯 Detected specific goal:', specificMatch);
    return generateSpecificGoalSpec(dreamText, duration, timeframe, specificMatch);
  }

  // Enhanced goal type detection with comprehensive keywords
  const goalKeywords = {
    fitness: ['run', 'marathon', 'fitness', 'exercise', 'workout', 'gym', 'train', 'jog', 'lose weight', 'gain muscle', 'get fit', 'shape', 'cardio', 'strength', 'bike', 'cycle', 'swim', 'yoga', 'pilates'],
    learning: ['learn language', 'study language', 'spanish', 'french', 'german', 'chinese', 'skill course', 'education', 'programming', 'coding', 'guitar lessons', 'piano lessons'],
    writing: ['write', 'novel', 'book', 'story', 'blog', 'article', 'screenplay', 'poetry', 'journal', 'memoir', 'fiction', 'publish'],
    business: ['business', 'startup', 'company', 'revenue', 'profit', 'sales', 'customers', 'launch', 'product', 'service', 'marketing', 'brand', 'entrepreneur'],
    health: ['health', 'diet', 'nutrition', 'sleep', 'meditation', 'mindfulness', 'therapy', 'wellness', 'habit', 'routine', 'lifestyle', 'mental health'],
    creative: ['create art', 'build project', 'design', 'art project', 'craft project', 'video', 'music composition', 'paint', 'sculpt', 'draw']
  };

  // Find best matching category
  let bestCategory = 'general';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(goalKeywords)) {
    const matches = keywords.filter(keyword => dream.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }

  console.log('📊 Category matches:', Object.fromEntries(
    Object.entries(goalKeywords).map(([cat, keywords]) => [
      cat, keywords.filter(keyword => dream.includes(keyword))
    ])
  ));
  console.log('🏆 Best category:', bestCategory);

  // Generate spec based on detected category
  switch (bestCategory) {
    case 'fitness':
      return generateFitnessSpec(dreamText, duration, timeframe);
    case 'learning':
      return generateLearningSpec(dreamText, duration, timeframe);
    case 'writing':
      return generateWritingSpec(dreamText, duration, timeframe);
    case 'business':
      return generateBusinessSpec(dreamText, duration, timeframe);
    case 'health':
      return generateHealthSpec(dreamText, duration, timeframe);
    case 'creative':
      return generateCreativeSpec(dreamText, duration, timeframe);
    default:
      return generateGenericSpec(dreamText, duration, timeframe);
  }
}

function generateFitnessSpec(dreamText, duration, timeframe) {
  const isMarathon = dreamText.toLowerCase().includes('marathon');
  const targetDistance = isMarathon ? (dreamText.includes('half') ? 13.1 : 26.2) : 5;

  return {
    title: isMarathon ? `${dreamText.includes('half') ? 'Half ' : ''}Marathon Training` : 'Fitness Goal',
    duration: timeframe,
    category: 'fitness',
    target: `${targetDistance} miles`,
    milestones: generateFitnessMilestones(duration, targetDistance),
    trackers: [
      { name: 'Weekly Miles', type: 'number', unit: 'miles', target: targetDistance * 0.8 },
      { name: 'Longest Run', type: 'number', unit: 'miles', target: targetDistance },
      { name: 'Training Days', type: 'counter', target: Math.floor(duration * 0.6) }
    ],
    motivation: [
      "Every mile is progress toward your goal! 🏃‍♂️",
      "Trust the process - your body is getting stronger",
      "Small steps today, big achievements tomorrow",
      "You're building the discipline that lasts a lifetime",
      "Remember why you started when it gets tough"
    ],
    gamification: {
      streaks: true,
      xpPerMile: 10,
      badges: ['First 5K', 'Consistency Champion', 'Distance Destroyer']
    }
  };
}

function generateLearningSpec(dreamText, duration, timeframe) {
  const language = extractLanguage(dreamText) || 'Spanish';

  return {
    title: `Learn ${language}`,
    duration: timeframe,
    category: 'learning',
    target: `Conversational ${language}`,
    milestones: generateLearningMilestones(duration, language),
    trackers: [
      { name: 'Vocabulary Words', type: 'counter', target: 1000 },
      { name: 'Study Hours', type: 'number', unit: 'hours', target: duration * 0.5 },
      { name: 'Lessons Completed', type: 'counter', target: Math.floor(duration / 2) }
    ],
    motivation: [
      `¡Excelente! Every word brings you closer to fluency 📚`,
      "Language learning is a journey, not a destination",
      "Practice makes progress - you're doing great!",
      "Immerse yourself and watch the magic happen",
      "Mistakes are proof you're trying - keep going!"
    ],
    gamification: {
      streaks: true,
      xpPerWord: 5,
      badges: ['First 100 Words', 'Study Streak', 'Grammar Master']
    }
  };
}

function generateWritingSpec(dreamText, duration, timeframe) {
  const isNovel = dreamText.toLowerCase().includes('novel');
  const targetWords = isNovel ? 80000 : 20000;

  return {
    title: isNovel ? 'Write a Novel' : 'Writing Project',
    duration: timeframe,
    category: 'writing',
    target: `${targetWords.toLocaleString()} words`,
    milestones: generateWritingMilestones(duration, targetWords),
    trackers: [
      { name: 'Words Written', type: 'counter', target: targetWords },
      { name: 'Daily Word Count', type: 'number', unit: 'words', target: Math.floor(targetWords / duration) },
      { name: 'Writing Days', type: 'counter', target: Math.floor(duration * 0.8) }
    ],
    motivation: [
      "Every word is a step closer to your masterpiece ✍️",
      "The first draft is just the beginning - keep writing!",
      "Your story matters - the world needs to hear it",
      "Writers write, even when inspiration is hiding",
      "Progress over perfection - you've got this!"
    ],
    gamification: {
      streaks: true,
      xpPerWord: 1,
      badges: ['First Chapter', 'Word Warrior', 'The End']
    }
  };
}

function generateBusinessSpec(dreamText, duration, timeframe) {
  return {
    title: 'Business Goal',
    duration: timeframe,
    category: 'business',
    target: 'Launch successful business',
    milestones: [
      { week: Math.floor(duration / 28), title: 'Research & Planning', description: 'Market research and business plan', target: 'Business plan complete' },
      { week: Math.floor(duration / 14), title: 'MVP Development', description: 'Build minimum viable product', target: 'Product ready' },
      { week: Math.floor(duration * 0.75 / 7), title: 'Launch & Marketing', description: 'Go to market strategy', target: 'First customers' },
      { week: Math.floor(duration / 7) - 1, title: 'Growth & Scale', description: 'Optimize and expand', target: 'Revenue targets met' }
    ],
    trackers: [
      { name: 'Revenue', type: 'number', unit: '$', target: 5000 },
      { name: 'Customers', type: 'counter', target: 50 },
      { name: 'Work Hours', type: 'number', unit: 'hours', target: duration * 2 }
    ],
    motivation: [
      "Every entrepreneur started with a dream - you're making it real! 💼",
      "Building a business is building your future",
      "Focus on solving problems, success will follow",
      "Persistence beats perfection in business",
      "Your customers are waiting for what you're building"
    ],
    gamification: {
      streaks: true,
      xpPerCustomer: 50,
      badges: ['First Sale', 'Customer Champion', 'Revenue Rocket']
    }
  };
}

function generateHealthSpec(dreamText, duration, timeframe) {
  return {
    title: 'Health & Wellness Goal',
    duration: timeframe,
    category: 'health',
    target: 'Improved health and wellness',
    milestones: [
      { week: 2, title: 'Foundation', description: 'Establish healthy routines', target: 'Daily habits set' },
      { week: Math.floor(duration / 14), title: 'Consistency', description: 'Build momentum', target: '2 weeks of consistency' },
      { week: Math.floor(duration * 0.6 / 7), title: 'Progress', description: 'See measurable improvements', target: 'Noticeable changes' },
      { week: Math.floor(duration / 7) - 1, title: 'Lifestyle', description: 'Sustainable healthy living', target: 'New lifestyle achieved' }
    ],
    trackers: [
      { name: 'Healthy Days', type: 'counter', target: Math.floor(duration * 0.8) },
      { name: 'Sleep Hours', type: 'number', unit: 'hours', target: 8 },
      { name: 'Water Intake', type: 'number', unit: 'glasses', target: 8 }
    ],
    motivation: [
      "Your health is your greatest wealth! 🌱",
      "Small changes lead to big transformations",
      "You're investing in your future self",
      "Progress, not perfection, is the goal",
      "Every healthy choice is a victory"
    ],
    gamification: {
      streaks: true,
      xpPerDay: 25,
      badges: ['Healthy Start', 'Consistency King', 'Wellness Warrior']
    }
  };
}

function generateCreativeSpec(dreamText, duration, timeframe) {
  return {
    title: 'Creative Project',
    duration: timeframe,
    category: 'creative',
    target: 'Complete creative project',
    milestones: [
      { week: Math.floor(duration / 28), title: 'Inspiration', description: 'Gather ideas and plan', target: 'Project concept ready' },
      { week: Math.floor(duration / 14), title: 'Creation', description: 'Start building/making', target: '25% complete' },
      { week: Math.floor(duration * 0.75 / 7), title: 'Refinement', description: 'Polish and improve', target: '75% complete' },
      { week: Math.floor(duration / 7) - 1, title: 'Completion', description: 'Finish and share', target: 'Project complete' }
    ],
    trackers: [
      { name: 'Creative Hours', type: 'number', unit: 'hours', target: duration },
      { name: 'Project Progress', type: 'percentage', target: 100 },
      { name: 'Creative Days', type: 'counter', target: Math.floor(duration * 0.7) }
    ],
    motivation: [
      "Your creativity is a gift to the world! 🎨",
      "Art is not what you see, but what you make others see",
      "Every master was once a beginner",
      "Create something that makes you proud",
      "The world needs your unique perspective"
    ],
    gamification: {
      streaks: true,
      xpPerHour: 15,
      badges: ['Creative Spark', 'Artistic Flow', 'Masterpiece Maker']
    }
  };
}

function generateSpecificGoalSpec(dreamText, duration, timeframe, goalType) {
  const specs = {
    sourdough: {
      title: 'Master Sourdough Baking',
      category: 'creative',
      target: 'Bake perfect sourdough loaves',
      trackers: [
        { name: 'Loaves Baked', type: 'counter', target: 20 },
        { name: 'Starter Days', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Successful Bakes', type: 'counter', target: 15 }
      ],
      motivation: [
        "Every loaf is a step toward mastery! 🍞",
        "Patience and practice make perfect bread",
        "Your starter is alive - nurture it daily",
        "The smell of fresh bread is worth the effort",
        "Sourdough is an art form - you're the artist!"
      ]
    },
    cooking: {
      title: 'Become a Cooking Master',
      category: 'creative',
      target: 'Cook amazing meals confidently',
      trackers: [
        { name: 'Recipes Mastered', type: 'counter', target: 30 },
        { name: 'Cooking Days', type: 'counter', target: Math.floor(duration * 0.7) },
        { name: 'New Techniques', type: 'counter', target: 10 }
      ],
      motivation: [
        "Every dish is a delicious experiment! 👨‍🍳",
        "Cooking is love made visible",
        "Master the basics, then get creative",
        "Your kitchen is your laboratory",
        "Great chefs are made, not born!"
      ]
    },
    juggling: {
      title: 'Learn to Juggle Like a Pro',
      category: 'creative',
      target: 'Juggle 3 balls consistently',
      trackers: [
        { name: 'Practice Sessions', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Consecutive Catches', type: 'number', target: 50 },
        { name: 'Tricks Learned', type: 'counter', target: 5 }
      ],
      motivation: [
        "Drop the ball? Pick it up and try again! 🤹‍♂️",
        "Juggling is all about rhythm and patience",
        "Every drop teaches you something new",
        "Soon you'll be the life of the party!",
        "Practice makes permanent, not perfect"
      ]
    },
    photography: {
      title: 'Master Photography',
      category: 'creative',
      target: 'Build stunning photo portfolio',
      trackers: [
        { name: 'Photos Taken', type: 'counter', target: 500 },
        { name: 'Portfolio Photos', type: 'counter', target: 50 },
        { name: 'Techniques Learned', type: 'counter', target: 15 }
      ],
      motivation: [
        "Every click captures a moment in time! 📸",
        "Light is your paintbrush, the world your canvas",
        "The best camera is the one you have with you",
        "Photography is about seeing, not just looking",
        "Your unique perspective matters!"
      ]
    },
    lucid_dreaming: {
      title: 'Master Lucid Dreaming',
      category: 'personal',
      target: 'Achieve consistent lucid dreams',
      trackers: [
        { name: 'Dream Journal Entries', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Lucid Dreams', type: 'counter', target: 10 },
        { name: 'Reality Checks', type: 'counter', target: Math.floor(duration * 5) }
      ],
      motivation: [
        "Your dreams are your playground! 🌙",
        "Awareness in dreams leads to awareness in life",
        "Every dream journal entry brings you closer",
        "Reality checks become second nature",
        "The dream world awaits your consciousness!"
      ]
    },
    youtube: {
      title: 'Build YouTube Channel',
      category: 'business',
      target: 'Grow successful YouTube channel',
      trackers: [
        { name: 'Videos Published', type: 'counter', target: 50 },
        { name: 'Subscribers', type: 'counter', target: 1000 },
        { name: 'Total Views', type: 'number', target: 10000 }
      ],
      motivation: [
        "Every video is a step toward your audience! 📹",
        "Consistency beats perfection on YouTube",
        "Your unique voice matters in the noise",
        "Subscribers are people who believe in you",
        "The algorithm rewards authentic creators!"
      ]
    },
    day_trading: {
      title: 'Master Day Trading',
      category: 'financial',
      target: 'Become profitable day trader',
      trackers: [
        { name: 'Trading Days', type: 'counter', target: Math.floor(duration * 0.7) },
        { name: 'Profitable Trades', type: 'counter', target: 100 },
        { name: 'Study Hours', type: 'number', unit: 'hours', target: 200 }
      ],
      motivation: [
        "Discipline and patience create profits! 📈",
        "Every loss is a lesson in disguise",
        "Risk management is your best friend",
        "The market rewards prepared minds",
        "Consistency beats home runs in trading!"
      ]
    },
    treehouse: {
      title: 'Build a Treehouse',
      category: 'creative',
      target: 'Complete amazing treehouse for kids',
      trackers: [
        { name: 'Planning Hours', type: 'number', unit: 'hours', target: 20 },
        { name: 'Build Days', type: 'counter', target: Math.floor(duration * 0.3) },
        { name: 'Materials Acquired', type: 'percentage', target: 100 }
      ],
      motivation: [
        "Building memories one plank at a time! 🏠",
        "Your kids will treasure this forever",
        "Every nail brings the dream closer to reality",
        "Safety first, fun second, memories forever",
        "The best playground is the one you build yourself!"
      ]
    },
    vegetable_garden: {
      title: 'Grow Vegetable Garden',
      category: 'creative',
      target: 'Become self-sufficient with vegetables',
      trackers: [
        { name: 'Plants Growing', type: 'counter', target: 20 },
        { name: 'Harvest Days', type: 'counter', target: Math.floor(duration * 0.4) },
        { name: 'Vegetables Harvested', type: 'counter', target: 100 }
      ],
      motivation: [
        "From seed to table - you're growing life! 🌱",
        "Every plant is a step toward self-sufficiency",
        "Nature rewards patience and care",
        "Fresh vegetables taste like victory",
        "You're feeding your family with your own hands!"
      ]
    },
    beatboxing: {
      title: 'Master Beatboxing',
      category: 'creative',
      target: 'Join a band as beatboxer',
      trackers: [
        { name: 'Practice Sessions', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Beats Mastered', type: 'counter', target: 15 },
        { name: 'Performance Ready', type: 'percentage', target: 100 }
      ],
      motivation: [
        "Your mouth is your instrument! 🎵",
        "Every beat brings you closer to the stage",
        "Rhythm is in your soul - let it out",
        "Bands need beatboxers - be their missing piece",
        "Make music with nothing but your voice!"
      ]
    },
    origami: {
      title: 'Master Origami',
      category: 'creative',
      target: 'Teach origami to others',
      trackers: [
        { name: 'Models Learned', type: 'counter', target: 50 },
        { name: 'Practice Hours', type: 'number', unit: 'hours', target: Math.floor(duration * 2) },
        { name: 'People Taught', type: 'counter', target: 10 }
      ],
      motivation: [
        "Paper becomes art in your hands! 📜",
        "Patience and precision create beauty",
        "Every fold is a meditation",
        "Teaching others multiplies the joy",
        "Ancient art, modern master - that's you!"
      ]
    },
    scuba: {
      title: 'Become Scuba Diving Instructor',
      category: 'career',
      target: 'Get certified as scuba instructor',
      trackers: [
        { name: 'Certification Levels', type: 'counter', target: 5 },
        { name: 'Dive Hours', type: 'number', unit: 'hours', target: 100 },
        { name: 'Students Taught', type: 'counter', target: 20 }
      ],
      motivation: [
        "The ocean is calling - answer with expertise! 🌊",
        "Every dive deepens your knowledge",
        "Safety first, adventure always",
        "Share the underwater world with others",
        "Turn your passion into your profession!"
      ]
    },
    public_speaking: {
      title: 'Overcome Fear of Public Speaking',
      category: 'personal',
      target: 'Speak confidently in public',
      trackers: [
        { name: 'Practice Sessions', type: 'counter', target: Math.floor(duration * 0.6) },
        { name: 'Speeches Given', type: 'counter', target: 10 },
        { name: 'Confidence Level', type: 'percentage', target: 100 }
      ],
      motivation: [
        "Your voice deserves to be heard! 🎤",
        "Every speech makes you stronger",
        "Fear is just excitement without breath",
        "The audience wants you to succeed",
        "Confidence grows with every word spoken!"
      ]
    },
    minimalism: {
      title: 'Become Minimalist',
      category: 'personal',
      target: 'Declutter life and embrace minimalism',
      trackers: [
        { name: 'Items Decluttered', type: 'counter', target: 500 },
        { name: 'Rooms Organized', type: 'counter', target: 8 },
        { name: 'Minimalist Days', type: 'counter', target: Math.floor(duration * 0.8) }
      ],
      motivation: [
        "Less stuff, more life! ✨",
        "Every item removed creates space for joy",
        "Minimalism is maximum freedom",
        "Own less, live more",
        "Simplicity is the ultimate sophistication!"
      ]
    },
    friendship: {
      title: 'Build Genuine Friendships',
      category: 'social',
      target: 'Make 5 new genuine friends',
      trackers: [
        { name: 'New People Met', type: 'counter', target: 25 },
        { name: 'Deep Conversations', type: 'counter', target: 15 },
        { name: 'Genuine Friends', type: 'counter', target: 5 }
      ],
      motivation: [
        "Friendship is life's greatest treasure! 👥",
        "Every conversation is a potential connection",
        "Be the friend you want to have",
        "Quality over quantity in relationships",
        "Your tribe is out there - keep looking!"
      ]
    },
    reconnect_friends: {
      title: 'Reconnect with Old Friends',
      category: 'social',
      target: 'Strengthen bonds with old friends',
      trackers: [
        { name: 'Friends Contacted', type: 'counter', target: 15 },
        { name: 'Meetups Organized', type: 'counter', target: 8 },
        { name: 'Bonds Strengthened', type: 'counter', target: 10 }
      ],
      motivation: [
        "Old friends are life's greatest gifts! 💝",
        "Time apart makes reunion sweeter",
        "Reach out - they miss you too",
        "Shared memories are priceless treasures",
        "Friendship transcends time and distance!"
      ]
    },
    calligraphy: {
      title: 'Master Calligraphy',
      category: 'creative',
      target: 'Create beautiful calligraphy art',
      trackers: [
        { name: 'Practice Sessions', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Styles Learned', type: 'counter', target: 5 },
        { name: 'Artworks Created', type: 'counter', target: 20 }
      ],
      motivation: [
        "Every stroke is a work of art! ✒️",
        "Beautiful writing is meditation in motion",
        "Your hand creates what your heart feels",
        "Patience and practice create perfection",
        "Ancient art, modern master!"
      ]
    },
    magic_tricks: {
      title: 'Learn Magic Tricks',
      category: 'creative',
      target: 'Amaze friends with magic',
      trackers: [
        { name: 'Tricks Learned', type: 'counter', target: 25 },
        { name: 'Practice Hours', type: 'number', unit: 'hours', target: Math.floor(duration * 2) },
        { name: 'Performances Given', type: 'counter', target: 10 }
      ],
      motivation: [
        "Magic is wonder made visible! 🎩",
        "Every trick mastered is a moment of amazement",
        "Practice makes the impossible possible",
        "Your audience believes in magic because of you",
        "The real magic is in bringing joy to others!"
      ]
    },
    pushups: {
      title: 'Master 100 Push-ups',
      category: 'fitness',
      target: 'Do 100 push-ups in a row',
      trackers: [
        { name: 'Max Push-ups', type: 'number', target: 100 },
        { name: 'Training Days', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Total Push-ups', type: 'counter', target: 5000 }
      ],
      motivation: [
        "Every push-up builds unstoppable strength! 💪",
        "Your body is capable of amazing things",
        "100 push-ups = 100% dedication",
        "Strength isn't given, it's earned",
        "Push through the burn, embrace the power!"
      ]
    },
    meditation: {
      title: 'Daily Meditation Practice',
      category: 'health',
      target: 'Find inner peace through meditation',
      trackers: [
        { name: 'Meditation Days', type: 'counter', target: Math.floor(duration * 0.9) },
        { name: 'Total Minutes', type: 'number', unit: 'minutes', target: duration * 20 },
        { name: 'Peaceful Moments', type: 'counter', target: Math.floor(duration * 0.7) }
      ],
      motivation: [
        "Peace begins with a single breath 🧘‍♂️",
        "Every moment of stillness is a victory",
        "Your mind is training for tranquility",
        "Inner peace is your natural state",
        "Meditation is not escape, it's coming home"
      ]
    },
    reading: {
      title: 'Reading Challenge',
      category: 'learning',
      target: 'Read 52 books this year',
      trackers: [
        { name: 'Books Read', type: 'counter', target: 52 },
        { name: 'Pages Read', type: 'counter', target: 15000 },
        { name: 'Reading Days', type: 'counter', target: Math.floor(duration * 0.8) }
      ],
      motivation: [
        "Every book is a new adventure! 📚",
        "Reading is dreaming with open eyes",
        "Knowledge grows with every page turned",
        "Books are portals to infinite worlds",
        "Your mind expands with every story!"
      ]
    },
    podcast: {
      title: 'Launch Successful Podcast',
      category: 'business',
      target: 'Get 1000 podcast listeners',
      trackers: [
        { name: 'Episodes Published', type: 'counter', target: 26 },
        { name: 'Total Listeners', type: 'counter', target: 1000 },
        { name: 'Recording Hours', type: 'number', unit: 'hours', target: 100 }
      ],
      motivation: [
        "Your voice deserves to be heard! 🎙️",
        "Every episode builds your audience",
        "Consistency creates loyal listeners",
        "Share your passion with the world",
        "Podcasting is storytelling for the digital age!"
      ]
    },
    travel: {
      title: 'World Travel Adventure',
      category: 'personal',
      target: 'Visit 10 new countries',
      trackers: [
        { name: 'Countries Visited', type: 'counter', target: 10 },
        { name: 'Cities Explored', type: 'counter', target: 25 },
        { name: 'Cultural Experiences', type: 'counter', target: 50 }
      ],
      motivation: [
        "The world is your classroom! 🌍",
        "Every country teaches you something new",
        "Travel broadens the mind and soul",
        "Collect moments, not just souvenirs",
        "Adventure awaits beyond your comfort zone!"
      ]
    },
    wine: {
      title: 'Become Wine Connoisseur',
      category: 'learning',
      target: 'Master wine knowledge and become sommelier',
      trackers: [
        { name: 'Wines Tasted', type: 'counter', target: 200 },
        { name: 'Wine Regions Studied', type: 'counter', target: 15 },
        { name: 'Certification Progress', type: 'percentage', target: 100 }
      ],
      motivation: [
        "Every sip is a journey through terroir! 🍷",
        "Wine is poetry in a bottle",
        "Your palate is developing sophistication",
        "Great wines tell stories of their land",
        "Become the sommelier you dream to be!"
      ]
    },
    guitar: {
      title: 'Learn Guitar & Perform',
      category: 'creative',
      target: 'Play guitar at open mic nights',
      trackers: [
        { name: 'Practice Hours', type: 'number', unit: 'hours', target: Math.floor(duration * 2) },
        { name: 'Songs Learned', type: 'counter', target: 20 },
        { name: 'Performances Given', type: 'counter', target: 5 }
      ],
      motivation: [
        "Every chord brings you closer to the stage! 🎸",
        "Music is the universal language of the soul",
        "Your fingers are learning to speak music",
        "Open mic nights await your unique sound",
        "Strum your way to musical mastery!"
      ]
    },
    weight_loss: {
      title: 'Ultimate Fitness Transformation',
      category: 'fitness',
      target: 'Lose 30 pounds and get in best shape',
      trackers: [
        { name: 'Weight Lost', type: 'number', unit: 'lbs', target: 30 },
        { name: 'Workout Days', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Healthy Meals', type: 'counter', target: Math.floor(duration * 2) }
      ],
      motivation: [
        "Every pound lost is a victory won! 💪",
        "Your body is transforming into its best version",
        "Discipline today, confidence tomorrow",
        "You're not just losing weight, you're gaining life",
        "The best shape of your life awaits!"
      ]
    },
    tiny_house: {
      title: 'Build Tiny House & Live Off-Grid',
      category: 'creative',
      target: 'Complete tiny house and live sustainably',
      trackers: [
        { name: 'Construction Progress', type: 'percentage', target: 100 },
        { name: 'Skills Learned', type: 'counter', target: 15 },
        { name: 'Sustainable Systems', type: 'counter', target: 8 }
      ],
      motivation: [
        "Small house, big dreams! 🏠",
        "Building your future one nail at a time",
        "Simplicity is the ultimate sophistication",
        "Off-grid living = ultimate freedom",
        "Your sustainable paradise awaits!"
      ]
    },
    early_riser: {
      title: 'Become 5 AM Productivity Master',
      category: 'personal',
      target: 'Wake up at 5 AM daily and boost productivity',
      trackers: [
        { name: '5 AM Wake-ups', type: 'counter', target: Math.floor(duration * 0.9) },
        { name: 'Morning Routine Days', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Productive Hours', type: 'number', unit: 'hours', target: duration * 2 }
      ],
      motivation: [
        "The early bird catches the worm! 🌅",
        "5 AM is your secret weapon for success",
        "While others sleep, you're building your future",
        "Morning discipline creates daily victories",
        "Productivity starts before the world wakes up!"
      ]
    },
    hiking: {
      title: 'Hike the Appalachian Trail',
      category: 'fitness',
      target: 'Complete the entire Appalachian Trail',
      trackers: [
        { name: 'Miles Hiked', type: 'number', unit: 'miles', target: 2190 },
        { name: 'Training Days', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Gear Acquired', type: 'percentage', target: 100 }
      ],
      motivation: [
        "Every step brings you closer to the summit! 🥾",
        "The trail teaches you about yourself",
        "Mountains are calling and you must go",
        "One foot in front of the other",
        "The journey of 2,190 miles begins with a single step!"
      ]
    },
    chess: {
      title: 'Master Chess & Compete',
      category: 'learning',
      target: 'Compete in chess tournaments',
      trackers: [
        { name: 'Games Played', type: 'counter', target: 500 },
        { name: 'Rating Points', type: 'number', target: 1800 },
        { name: 'Tournaments Entered', type: 'counter', target: 5 }
      ],
      motivation: [
        "Every move teaches you strategy! ♟️",
        "Chess is the gymnasium of the mind",
        "Think three moves ahead",
        "Patience and tactics win games",
        "Become the grandmaster of your own game!"
      ]
    },
    food_truck: {
      title: 'Launch Food Truck Business',
      category: 'business',
      target: 'Start successful food truck',
      trackers: [
        { name: 'Business Plan Progress', type: 'percentage', target: 100 },
        { name: 'Permits Obtained', type: 'counter', target: 8 },
        { name: 'Revenue', type: 'number', unit: '$', target: 50000 }
      ],
      motivation: [
        "Your culinary dreams are on wheels! 🚚",
        "Every meal served builds your business",
        "Food brings people together",
        "Your recipes deserve to be shared",
        "Success is served one customer at a time!"
      ]
    },
    freelance_design: {
      title: 'Become Freelance Designer',
      category: 'business',
      target: 'Build successful freelance design career',
      trackers: [
        { name: 'Clients Acquired', type: 'counter', target: 20 },
        { name: 'Projects Completed', type: 'counter', target: 50 },
        { name: 'Monthly Income', type: 'number', unit: '$', target: 5000 }
      ],
      motivation: [
        "Your creativity pays the bills! 🎨",
        "Every design tells a story",
        "Freelance freedom is worth the hustle",
        "Your portfolio is your passport to success",
        "Design the career you want!"
      ]
    },
    rock_climbing: {
      title: 'Master Rock Climbing',
      category: 'fitness',
      target: 'Conquer your first mountain',
      trackers: [
        { name: 'Climbing Sessions', type: 'counter', target: Math.floor(duration * 0.6) },
        { name: 'Routes Completed', type: 'counter', target: 100 },
        { name: 'Skill Level', type: 'percentage', target: 100 }
      ],
      motivation: [
        "Reach new heights every day! 🧗‍♂️",
        "The mountain doesn't care about your excuses",
        "Grip strength builds character",
        "Every hold teaches you perseverance",
        "The summit is just the beginning!"
      ]
    },
    triathlon: {
      title: 'Complete a Triathlon',
      category: 'fitness',
      target: 'Finish your first triathlon',
      trackers: [
        { name: 'Training Sessions', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Swim Distance', type: 'number', unit: 'miles', target: 50 },
        { name: 'Bike Distance', type: 'number', unit: 'miles', target: 500 }
      ],
      motivation: [
        "Swim, bike, run - you're unstoppable! 🏊‍♂️🚴‍♂️🏃‍♂️",
        "Three sports, one incredible achievement",
        "Your body is capable of amazing things",
        "Endurance is built one workout at a time",
        "Cross that finish line like a champion!"
      ]
    },
    martial_arts: {
      title: 'Earn Black Belt',
      category: 'fitness',
      target: 'Achieve black belt in martial arts',
      trackers: [
        { name: 'Training Sessions', type: 'counter', target: Math.floor(duration * 0.8) },
        { name: 'Belt Levels', type: 'counter', target: 8 },
        { name: 'Techniques Mastered', type: 'counter', target: 50 }
      ],
      motivation: [
        "Discipline creates warriors! 🥋",
        "Every belt earned is a milestone conquered",
        "Martial arts builds body and character",
        "Respect, discipline, perseverance",
        "The black belt is just the beginning!"
      ]
    },
    dating: {
      title: 'Improve Dating Life',
      category: 'social',
      target: 'Find meaningful relationship',
      trackers: [
        { name: 'Dates Attended', type: 'counter', target: 20 },
        { name: 'Confidence Level', type: 'percentage', target: 100 },
        { name: 'Social Skills Practice', type: 'counter', target: Math.floor(duration * 0.5) }
      ],
      motivation: [
        "Love starts with loving yourself! 💕",
        "Every conversation is practice",
        "Authenticity attracts the right person",
        "Confidence is your best accessory",
        "Your person is out there - keep looking!"
      ]
    },
    parenting: {
      title: 'Become Better Parent',
      category: 'personal',
      target: 'Spend quality time with kids',
      trackers: [
        { name: 'Quality Time Hours', type: 'number', unit: 'hours', target: Math.floor(duration * 2) },
        { name: 'Activities Together', type: 'counter', target: 50 },
        { name: 'Parenting Skills', type: 'percentage', target: 100 }
      ],
      motivation: [
        "Your kids need you, not your perfection! 👨‍👩‍👧‍👦",
        "Quality time is the best gift you can give",
        "Every moment matters in their memory",
        "Parenting is the hardest job you'll ever love",
        "You're shaping the future, one hug at a time!"
      ]
    },
    survival: {
      title: 'Master Survival Skills',
      category: 'personal',
      target: 'Learn wilderness survival',
      trackers: [
        { name: 'Skills Learned', type: 'counter', target: 20 },
        { name: 'Camping Trips', type: 'counter', target: 10 },
        { name: 'Survival Challenges', type: 'counter', target: 5 }
      ],
      motivation: [
        "Nature is your classroom! 🏕️",
        "Self-reliance builds confidence",
        "Every skill could save your life",
        "The wilderness teaches what matters",
        "Become one with the wild!"
      ]
    },
    language_learning: {
      title: 'Polyglot Challenge',
      category: 'learning',
      target: 'Learn multiple languages',
      trackers: [
        { name: 'Languages Started', type: 'counter', target: 3 },
        { name: 'Study Hours', type: 'number', unit: 'hours', target: Math.floor(duration * 3) },
        { name: 'Conversations Held', type: 'counter', target: 50 }
      ],
      motivation: [
        "Every language opens a new world! 🌍",
        "Polyglots see the world differently",
        "Language is the key to culture",
        "Your brain grows with every word",
        "Speak the world into existence!"
      ]
    }
  };

  const spec = specs[goalType] || specs.sourdough;
  
  return {
    ...spec,
    duration: timeframe,
    milestones: generateCreativeMilestones(duration, spec.title),
    gamification: {
      streaks: true,
      xpPerAction: 15,
      badges: ['First Attempt', 'Getting Better', 'Master Level']
    }
  };
}

function generateCreativeMilestones(duration, title) {
  const weeks = Math.floor(duration / 7);
  return [
    { week: Math.floor(weeks * 0.2), title: 'Foundation', description: 'Learn the basics', target: 'Understand fundamentals' },
    { week: Math.floor(weeks * 0.5), title: 'Practice', description: 'Build skills through repetition', target: 'Consistent practice routine' },
    { week: Math.floor(weeks * 0.8), title: 'Refinement', description: 'Perfect your technique', target: 'Noticeable improvement' },
    { week: weeks - 1, title: 'Mastery', description: 'Achieve your goal', target: title.includes('Sourdough') ? 'Perfect loaf' : 'Goal achieved' }
  ];
}

function generateGenericSpec(dreamText, duration, timeframe) {
  return {
    title: dreamText,
    duration: timeframe,
    category: 'general',
    target: 'Complete goal',
    milestones: generateGenericMilestones(duration),
    trackers: [
      { name: 'Progress', type: 'percentage', target: 100 },
      { name: 'Days Active', type: 'counter', target: Math.floor(duration * 0.7) }
    ],
    motivation: [
      "You're making it happen, one day at a time! 🌟",
      "Consistency is the key to achieving any dream",
      "Believe in yourself - you've got what it takes",
      "Small progress is still progress",
      "Your future self will thank you for starting today"
    ],
    gamification: {
      streaks: true,
      xpPerDay: 20,
      badges: ['Getting Started', 'Halfway Hero', 'Goal Crusher']
    }
  };
}

function generateFitnessMilestones(duration, targetDistance) {
  const weeks = Math.floor(duration / 7);
  const milestones = [];

  if (weeks >= 12) {
    milestones.push(
      { week: 2, title: 'Build Base Fitness', description: 'Complete 3 easy runs per week', target: '3 miles longest run' },
      { week: 6, title: 'Increase Distance', description: 'Build weekly mileage', target: `${Math.floor(targetDistance * 0.4)} mile long run` },
      { week: 10, title: 'Peak Training', description: 'Longest training runs', target: `${Math.floor(targetDistance * 0.8)} mile long run` },
      { week: weeks - 1, title: 'Taper & Rest', description: 'Reduce volume, stay fresh', target: 'Race ready!' }
    );
  } else {
    milestones.push(
      { week: 2, title: 'Foundation', description: 'Establish routine', target: '2 mile run' },
      { week: Math.floor(weeks / 2), title: 'Build Up', description: 'Increase distance', target: `${Math.floor(targetDistance * 0.6)} miles` },
      { week: weeks - 1, title: 'Final Push', description: 'Peak fitness', target: 'Goal achieved!' }
    );
  }

  return milestones;
}

function generateLearningMilestones(duration, language) {
  const weeks = Math.floor(duration / 7);
  return [
    { week: 2, title: 'Basics', description: 'Learn essential phrases', target: '100 vocabulary words' },
    { week: Math.floor(weeks * 0.3), title: 'Grammar Foundation', description: 'Master basic grammar', target: 'Present tense verbs' },
    { week: Math.floor(weeks * 0.6), title: 'Conversation', description: 'Practice speaking', target: '500 vocabulary words' },
    { week: weeks - 1, title: 'Fluency', description: 'Confident communication', target: `Conversational ${language}` }
  ];
}

function generateWritingMilestones(duration, targetWords) {
  const weeks = Math.floor(duration / 7);
  const quarterWords = Math.floor(targetWords / 4);

  return [
    { week: Math.floor(weeks * 0.25), title: 'First Quarter', description: 'Story foundation', target: `${quarterWords.toLocaleString()} words` },
    { week: Math.floor(weeks * 0.5), title: 'Halfway Point', description: 'Plot development', target: `${(quarterWords * 2).toLocaleString()} words` },
    { week: Math.floor(weeks * 0.75), title: 'Three Quarters', description: 'Climax and resolution', target: `${(quarterWords * 3).toLocaleString()} words` },
    { week: weeks - 1, title: 'The End', description: 'Complete first draft', target: `${targetWords.toLocaleString()} words` }
  ];
}

function generateGenericMilestones(duration) {
  const weeks = Math.floor(duration / 7);
  return [
    { week: Math.floor(weeks * 0.25), title: 'Getting Started', description: 'Build momentum', target: '25% complete' },
    { week: Math.floor(weeks * 0.5), title: 'Halfway There', description: 'Maintain consistency', target: '50% complete' },
    { week: Math.floor(weeks * 0.75), title: 'Final Stretch', description: 'Push through challenges', target: '75% complete' },
    { week: weeks - 1, title: 'Achievement', description: 'Reach your goal', target: '100% complete' }
  ];
}

function extractLanguage(dreamText) {
  const languages = ['spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean'];
  for (const lang of languages) {
    if (dreamText.toLowerCase().includes(lang)) {
      return lang.charAt(0).toUpperCase() + lang.slice(1);
    }
  }
  return null;
}