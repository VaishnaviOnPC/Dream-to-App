import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ReferenceLine } from 'recharts';
import { Trophy, Target, Calendar, TrendingUp, Flame, Star, Plus, Camera, Share2, Bell, CheckCircle, X, Edit3, Moon, Sun } from 'lucide-react';

export default function DreamApp({ spec }) {
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState(0);
  const [currentMotivation, setCurrentMotivation] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [logValue, setLogValue] = useState('');
  const [logNote, setLogNote] = useState('');
  const [logDate, setLogDate] = useState('');
  const [chartView, setChartView] = useState('daily'); // 'daily' or 'cumulative'
  const [darkMode, setDarkMode] = useState(false);
  const [progressHistory, setProgressHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [dailyGoals, setDailyGoals] = useState({});
  const [completedMilestones, setCompletedMilestones] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`dream-app-${spec.title}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setProgress(data.progress || {});
      setStreak(data.streak || 0);
      setProgressHistory(data.progressHistory || []);
      setAchievements(data.achievements || []);
      setCompletedMilestones(data.completedMilestones || []);
      setDarkMode(data.darkMode || false);
    } else {
      // Initialize progress tracking
      const initialProgress = {};
      spec.trackers.forEach(tracker => {
        initialProgress[tracker.name] = tracker.type === 'counter' ? 0 : tracker.type === 'percentage' ? 0 : 0;
      });
      setProgress(initialProgress);
      
      // Set initial daily goals
      const initialDailyGoals = {};
      spec.trackers.forEach(tracker => {
        if (tracker.name.includes('Daily') || tracker.name.includes('Words')) {
          initialDailyGoals[tracker.name] = Math.ceil(tracker.target / 30); // Monthly target
        }
      });
      setDailyGoals(initialDailyGoals);
    }

    // Calculate initial streak
    calculateStreak();

    // Rotate motivation messages
    const interval = setInterval(() => {
      setCurrentMotivation(prev => (prev + 1) % spec.motivation.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [spec]);

  // Recalculate streak when progress history changes
  useEffect(() => {
    calculateStreak();
  }, [progressHistory]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      progress,
      streak,
      progressHistory,
      achievements,
      completedMilestones,
      darkMode,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`dream-app-${spec.title}`, JSON.stringify(dataToSave));
  }, [progress, streak, progressHistory, achievements, completedMilestones, darkMode, spec.title]);

  const calculateStreak = () => {
    if (progressHistory.length === 0) {
      setStreak(0);
      return;
    }

    // Get all unique dates with activity (any tracker, any positive value)
    const activeDates = [...new Set(
      progressHistory
        .filter(entry => entry.change > 0)
        .map(entry => entry.date)
    )].sort();

    if (activeDates.length === 0) {
      setStreak(0);
      return;
    }

    // Calculate consecutive days from today backwards
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let checkDate = new Date();

    // Check if today has activity
    if (activeDates.includes(today)) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If no activity today, check from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days backwards
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (activeDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      
      // Safety check - don't go back more than 30 days
      if (currentStreak > 30) break;
    }

    setStreak(currentStreak);
  };

  const updateProgress = (trackerName, value, note = '', selectedDate = null) => {
    const dailyValue = parseFloat(value) || 0;
    
    // Use selected date or default to today
    const entryDate = selectedDate || new Date().toISOString().split('T')[0];

    // Add to history as a daily entry
    const historyEntry = {
      date: entryDate,
      tracker: trackerName,
      value: dailyValue, // This is the daily value, not cumulative
      change: dailyValue, // Daily activity amount
      note: note,
      timestamp: Date.now()
    };
    
    setProgressHistory(prev => {
      // Remove any existing entry for the same date and tracker to avoid duplicates
      const filtered = prev.filter(entry => 
        !(entry.date === entryDate && entry.tracker === trackerName)
      );
      const newHistory = [...filtered, historyEntry];
      
      // Calculate new total progress for this tracker
      const totalForTracker = newHistory
        .filter(entry => entry.tracker === trackerName)
        .reduce((sum, entry) => sum + (entry.change > 0 ? entry.change : 0), 0);
      
      // Update the progress state with new total
      setProgress(prev => ({
        ...prev,
        [trackerName]: totalForTracker
      }));
      
      return newHistory.slice(-50); // Keep last 50 entries
    });

    // Calculate total progress for achievements
    const totalProgress = progressHistory
      .filter(entry => entry.tracker === trackerName)
      .reduce((sum, entry) => sum + (entry.change > 0 ? entry.change : 0), 0) + dailyValue;
    
    const oldTotal = progress[trackerName] || 0;
    
    // Check for achievements based on total progress
    checkAchievements(trackerName, totalProgress, oldTotal);
    
    // Calculate streak properly after updating history
    setTimeout(() => {
      calculateStreak();
    }, 0);
    
    if (dailyValue > 0) {
      showNotificationMessage(`Great job! Logged ${dailyValue} for ${trackerName}! 🔥`);
    }
  };

  const checkAchievements = (trackerName, newValue, oldValue) => {
    const tracker = spec.trackers.find(t => t.name === trackerName);
    if (!tracker) return;

    const progressPercent = (newValue / tracker.target) * 100;
    const oldProgressPercent = (oldValue / tracker.target) * 100;

    // Check milestone achievements
    const milestones = [25, 50, 75, 100];
    milestones.forEach(milestone => {
      if (progressPercent >= milestone && oldProgressPercent < milestone) {
        const achievement = {
          id: `${trackerName}-${milestone}`,
          title: `${milestone}% Complete!`,
          description: `Reached ${milestone}% of your ${trackerName} goal`,
          icon: milestone === 100 ? '🏆' : '⭐',
          unlockedAt: new Date().toISOString(),
          tracker: trackerName
        };
        
        setAchievements(prev => {
          if (!prev.find(a => a.id === achievement.id)) {
            showNotificationMessage(`🎉 Achievement Unlocked: ${achievement.title}`);
            return [...prev, achievement];
          }
          return prev;
        });
      }
    });
  };

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const openLogModal = (tracker) => {
    setSelectedTracker(tracker);
    setLogValue(''); // Start empty for daily entry
    setLogNote('');
    setLogDate(new Date().toISOString().split('T')[0]); // Default to today
    setShowLogModal(true);
  };

  const handleLogSubmit = () => {
    if (selectedTracker && logValue && logDate) {
      updateProgress(selectedTracker.name, logValue, logNote, logDate);
      setShowLogModal(false);
      setLogValue('');
      setLogNote('');
      setLogDate('');
      setSelectedTracker(null);
    }
  };

  const quickLogForDate = (chartDate) => {
    // Convert chart date back to ISO format
    const today = new Date();
    const targetDate = new Date(today);
    
    // Find the matching date from our data
    const dataPoint = progressData.find(d => d.day === chartDate);
    if (dataPoint && spec.trackers.length > 0) {
      // Auto-open modal for first tracker with the selected date
      const firstTracker = spec.trackers[0];
      setSelectedTracker(firstTracker);
      setLogValue('');
      setLogNote('');
      
      // Convert display date back to ISO date
      const dateIndex = progressData.findIndex(d => d.day === chartDate);
      const isoDate = new Date();
      isoDate.setDate(isoDate.getDate() - (progressData.length - 1 - dateIndex));
      setLogDate(isoDate.toISOString().split('T')[0]);
      
      setShowLogModal(true);
    }
  };

  const markMilestoneComplete = (milestoneIndex) => {
    if (!completedMilestones.includes(milestoneIndex)) {
      setCompletedMilestones(prev => [...prev, milestoneIndex]);
      showNotificationMessage(`🎯 Milestone completed: ${spec.milestones[milestoneIndex].title}!`);
    }
  };

  const getProgressPercentage = () => {
    const totalTrackers = spec.trackers.length;
    const completedProgress = spec.trackers.reduce((sum, tracker) => {
      const current = progress[tracker.name] || 0;
      const target = tracker.target;
      return sum + Math.min(current / target, 1);
    }, 0);
    return Math.round((completedProgress / totalTrackers) * 100);
  };

  const generateProgressData = () => {
    // Create a complete date range for the last 14 days
    const today = new Date();
    const dateRange = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dateRange.push(date.toISOString().split('T')[0]);
    }

    // Group progress history by date
    const dailyProgress = {};
    progressHistory.forEach(entry => {
      const day = entry.date;
      if (!dailyProgress[day]) {
        dailyProgress[day] = 0;
      }
      // Only count positive changes (actual activity, not reductions)
      if (entry.change > 0) {
        dailyProgress[day] += entry.change;
      }
    });

    // Generate data points for each day in range
    let cumulative = 0;
    const dataPoints = dateRange.map(date => {
      const dailyValue = dailyProgress[date] || 0;
      cumulative += dailyValue;
      
      return {
        day: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        daily: dailyValue, // Actual activity for this day
        cumulative: cumulative, // Running total
        target: spec.trackers[0]?.target || 100
      };
    });

    return dataPoints;
  };

  const getRecentActivity = () => {
    return progressHistory
      .slice(-5)
      .reverse()
      .map(entry => ({
        ...entry,
        timeAgo: getTimeAgo(entry.timestamp)
      }));
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleShare = async () => {
    const shareText = `🎯 I'm working on: ${spec.title}\n📊 Progress: ${overallProgress}%\n🔥 Streak: ${streak} days\n\nBuilt with Dream-to-App! Turn any goal into a tracking app.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${spec.title} Progress`,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        showNotificationMessage('📋 Progress copied to clipboard!');
      } catch (err) {
        // Final fallback: show share text in alert
        alert(shareText);
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const progressData = generateProgressData();
  const overallProgress = getProgressPercentage();
  const recentActivity = getRecentActivity();

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          {notificationMessage}
        </div>
      )}

      {/* Log Progress Modal */}
      {showLogModal && (
        <div className={`fixed inset-0 flex items-center justify-center z-40 p-4 ${
          darkMode ? 'bg-black/70 backdrop-blur-sm' : 'bg-black bg-opacity-50'
        }`}>
          <div className={`rounded-2xl p-6 w-full max-w-md transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-xl border border-slate-600/50 shadow-2xl shadow-purple-500/20' 
              : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className={`text-xl font-semibold ${
                  darkMode ? 'text-slate-100' : 'text-gray-900'
                }`}>Log Daily Activity</h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-300' : 'text-gray-600'
                }`}>{selectedTracker?.name}</p>
              </div>
              <button 
                onClick={() => setShowLogModal(false)} 
                className={`transition-colors ${
                  darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  📅 Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // Can't log future dates
                    min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Last 30 days
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    }`}
                  />
                  <div className="mt-1 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setLogDate(new Date().toISOString().split('T')[0])}
                      className={`text-xs font-medium transition-colors ${
                        darkMode 
                          ? 'text-purple-400 hover:text-purple-300' 
                          : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setLogDate(yesterday.toISOString().split('T')[0]);
                      }}
                      className={`text-xs font-medium transition-colors ${
                        darkMode 
                          ? 'text-purple-400 hover:text-purple-300' 
                          : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const lastWeek = new Date();
                        lastWeek.setDate(lastWeek.getDate() - 7);
                        setLogDate(lastWeek.toISOString().split('T')[0]);
                      }}
                      className={`text-xs font-medium transition-colors ${
                        darkMode 
                          ? 'text-purple-400 hover:text-purple-300' 
                          : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                    >
                      Last Week
                    </button>
                  </div>
                </div>
                {logDate && (
                  <div className={`mt-2 text-sm ${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    Logging for: {new Date(logDate + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  Daily Amount {selectedTracker?.unit && `(${selectedTracker.unit})`}
                </label>
                <input
                  type="number"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    darkMode 
                      ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                      : 'border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  }`}
                  placeholder="How much did you do this day?"
                  min="0"
                  step="0.1"
                />
                <div className={`mt-1 text-xs ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Enter the amount you did on this specific day
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  Notes (optional)
                </label>
                <textarea
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-200 resize-none ${
                    darkMode 
                      ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                      : 'border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  }`}
                  placeholder="How did it go? Any thoughts?"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleLogSubmit}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Log Progress
                </button>
                <button
                  onClick={() => setShowLogModal(false)}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                    darkMode 
                      ? 'border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`rounded-2xl shadow-2xl p-6 md:p-8 mb-6 transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 shadow-purple-500/10' 
            : 'bg-white'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
                darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-gray-900'
              }`}>{spec.title}</h1>
              <p className={`text-lg ${
                darkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>Target: {spec.target} in {spec.duration}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-3xl md:text-4xl font-bold ${
                  darkMode 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400' 
                    : 'text-indigo-600'
                }`}>{overallProgress}%</div>
                <div className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Complete</div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 shadow-lg shadow-yellow-500/20' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => handleShare()}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 shadow-lg shadow-purple-500/20' 
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                }`}
                title="Share your progress"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Progress Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-xl shadow-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 shadow-orange-500/20' 
                  : 'bg-white shadow-lg'
              }`}>
                <div className={`text-2xl font-bold ${
                  darkMode ? 'text-orange-300' : 'text-orange-500'
                }`}>{streak}</div>
                <div className={`text-xs ${
                  darkMode ? 'text-orange-200' : 'text-gray-600'
                }`}>Day Streak</div>
              </div>
              <div className={`rounded-xl shadow-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-400/30 shadow-emerald-500/20' 
                  : 'bg-white shadow-lg'
              }`}>
                <div className={`text-2xl font-bold ${
                  darkMode ? 'text-emerald-300' : 'text-green-500'
                }`}>{achievements.length}</div>
                <div className={`text-xs ${
                  darkMode ? 'text-emerald-200' : 'text-gray-600'
                }`}>Achievements</div>
              </div>
              <div className={`rounded-xl shadow-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 shadow-blue-500/20' 
                  : 'bg-white shadow-lg'
              }`}>
                <div className={`text-2xl font-bold ${
                  darkMode ? 'text-blue-300' : 'text-blue-500'
                }`}>{completedMilestones.length}</div>
                <div className={`text-xs ${
                  darkMode ? 'text-blue-200' : 'text-gray-600'
                }`}>Milestones</div>
              </div>
              <div className={`rounded-xl shadow-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 shadow-purple-500/20' 
                  : 'bg-white shadow-lg'
              }`}>
                <div className={`text-2xl font-bold ${
                  darkMode ? 'text-purple-300' : 'text-purple-500'
                }`}>{progressHistory.length}</div>
                <div className={`text-xs ${
                  darkMode ? 'text-purple-200' : 'text-gray-600'
                }`}>Log Entries</div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className={`rounded-2xl shadow-2xl p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 shadow-cyan-500/10' 
                : 'bg-white'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold flex items-center ${
                  darkMode ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  <TrendingUp className={`mr-2 ${
                    darkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`} size={24} />
                  Progress Journey
                </h2>
                <div className="flex items-center space-x-4">
                  {/* Chart View Toggle */}
                  <div className={`flex rounded-lg p-1 ${
                    darkMode ? 'bg-slate-700/50 backdrop-blur-sm border border-slate-600/30' : 'bg-gray-100'
                  }`}>
                    <button
                      onClick={() => setChartView('daily')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                        chartView === 'daily' 
                          ? darkMode 
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20' 
                            : 'bg-white text-indigo-600 shadow-sm'
                          : darkMode
                            ? 'text-slate-300 hover:text-cyan-300'
                            : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setChartView('cumulative')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                        chartView === 'cumulative' 
                          ? darkMode 
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20' 
                            : 'bg-white text-indigo-600 shadow-sm'
                          : darkMode
                            ? 'text-slate-300 hover:text-cyan-300'
                            : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Total
                    </button>
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    <span className="inline-block w-3 h-3 bg-indigo-500 rounded mr-2"></span>
                    {chartView === 'daily' ? 'Daily Activity' : 'Cumulative Progress'}
                    {progressData[0]?.target && chartView === 'cumulative' && (
                      <>
                        <span className="inline-block w-3 h-3 border-2 border-red-400 border-dashed rounded ml-4 mr-2"></span>
                        Target: {progressData[0].target}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart 
                  data={progressData} 
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  onClick={(data) => {
                    if (data && data.activeLabel) {
                      quickLogForDate(data.activeLabel);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#475569" : "#f1f5f9"} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#1e293b',
                      border: darkMode ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: darkMode ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' : 'none'
                    }}
                    formatter={(value, name) => [
                      name === 'cumulative' ? `${value} total` : `${value} daily`,
                      name === 'cumulative' ? 'Total Progress' : 'Daily Activity'
                    ]}
                    labelFormatter={(label) => `${label} - Click to log for this day`}
                  />
                  {/* Target line - only show for cumulative view */}
                  {progressData[0]?.target && chartView === 'cumulative' && (
                    <ReferenceLine 
                      y={progressData[0].target} 
                      stroke="#ef4444" 
                      strokeDasharray="8 8" 
                      strokeWidth={2}
                      label={{ value: "Goal", position: "topRight", fill: "#ef4444", fontSize: 12 }}
                    />
                  )}
                  {/* Main progress area */}
                  <Area 
                    type="monotone" 
                    dataKey={chartView === 'daily' ? 'daily' : 'cumulative'}
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorProgress)"
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Progress Stats */}
              <div className={`grid grid-cols-3 gap-4 mt-4 pt-4 border-t ${
                darkMode ? 'border-slate-600/50' : 'border-gray-100'
              }`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {progressData[progressData.length - 1]?.cumulative || 0}
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Total Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {progressData.filter(d => d.daily > 0).length}
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Active Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {progressData[0]?.target ? 
                      Math.round((progressData[progressData.length - 1]?.cumulative || 0) / progressData[0].target * 100) : 0}%
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Goal Complete</div>
                </div>
              </div>
            </div>

            {/* Interactive Trackers */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {spec.trackers.map((tracker, index) => (
                <div key={tracker.name} className={`rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/40 hover:border-purple-500/30 shadow-purple-500/5' 
                    : 'bg-white'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-lg font-semibold flex items-center ${
                      darkMode ? 'text-slate-100' : 'text-gray-900'
                    }`}>
                      <Target className={`mr-2 ${
                        darkMode ? 'text-emerald-400' : 'text-green-600'
                      }`} size={20} />
                      {tracker.name}
                    </h3>
                    <button
                      onClick={() => openLogModal(tracker)}
                      className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                        darkMode 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 shadow-lg shadow-purple-500/20' 
                          : 'bg-indigo-100 hover:bg-indigo-200'
                      }`}
                    >
                      <Plus className={`${
                        darkMode ? 'text-purple-300' : 'text-indigo-600'
                      }`} size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className={`text-2xl font-bold ${
                        darkMode 
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400' 
                          : 'text-gray-900'
                      }`}>
                        {(progress[tracker.name] || 0).toLocaleString()}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        / {tracker.target.toLocaleString()} {tracker.unit || ''}
                      </div>
                    </div>
                    
                    <div className={`w-full rounded-full h-3 ${
                      darkMode ? 'bg-slate-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          darkMode 
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30' 
                            : 'bg-gradient-to-r from-green-400 to-green-600'
                        }`}
                        style={{
                          width: `${Math.min(100, ((progress[tracker.name] || 0) / tracker.target) * 100)}%`
                        }}
                      ></div>
                    </div>
                    
                    <div className={`text-sm ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      {Math.round(((progress[tracker.name] || 0) / tracker.target) * 100)}% complete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Motivation Card */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="mr-2" size={20} />
                Daily Motivation
              </h3>
              <p className="text-sm leading-relaxed">
                {spec.motivation[currentMotivation]}
              </p>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-2xl shadow-2xl p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 shadow-blue-500/10' 
                : 'bg-white shadow-lg'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                darkMode ? 'text-slate-100' : 'text-gray-900'
              }`}>
                <Calendar className={`mr-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} size={20} />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 transform hover:scale-102 ${
                    darkMode 
                      ? 'bg-slate-700/50 backdrop-blur-sm border border-slate-600/30 hover:border-blue-400/50 shadow-lg shadow-blue-500/5' 
                      : 'bg-gray-50 rounded-lg'
                  }`}>
                    <div>
                      <div className={`text-sm font-medium ${
                        darkMode ? 'text-slate-100' : 'text-gray-900'
                      }`}>{activity.tracker}</div>
                      <div className={`text-xs ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        +{activity.change} {activity.timeAgo}
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      darkMode ? 'text-emerald-400' : 'text-green-600'
                    }`}>
                      +{activity.change}
                    </div>
                  </div>
                )) : (
                  <div className={`text-center py-4 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    <Calendar className={`mx-auto mb-2 ${
                      darkMode ? 'text-slate-500' : 'text-gray-400'
                    }`} size={32} />
                    <p className="text-sm">No activity yet</p>
                    <p className="text-xs">Start logging to see your progress!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className={`rounded-2xl shadow-2xl p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 shadow-yellow-500/10' 
                : 'bg-white shadow-lg'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                darkMode ? 'text-slate-100' : 'text-gray-900'
              }`}>
                <Trophy className={`mr-2 ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`} size={20} />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.length > 0 ? achievements.map((achievement, index) => (
                  <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-102 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border border-yellow-400/30 shadow-lg shadow-yellow-500/20' 
                      : 'bg-yellow-50 rounded-lg'
                  }`}>
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <div className={`text-sm font-medium ${
                        darkMode ? 'text-yellow-300' : 'text-yellow-800'
                      }`}>{achievement.title}</div>
                      <div className={`text-xs ${
                        darkMode ? 'text-yellow-400' : 'text-gray-500'
                      }`}>{achievement.description}</div>
                    </div>
                  </div>
                )) : (
                  <div className={`text-center py-4 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    <Trophy className={`mx-auto mb-2 ${
                      darkMode ? 'text-slate-500' : 'text-gray-400'
                    }`} size={32} />
                    <p className="text-sm">No achievements yet</p>
                    <p className="text-xs">Keep going to unlock rewards!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className={`rounded-2xl shadow-2xl p-6 mt-6 transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 shadow-emerald-500/10' 
            : 'bg-white shadow-lg'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 flex items-center ${
            darkMode ? 'text-slate-100' : 'text-gray-900'
          }`}>
            <Calendar className={`mr-2 ${
              darkMode ? 'text-emerald-400' : 'text-blue-600'
            }`} size={24} />
            Milestone Timeline
          </h2>
          <div className="space-y-4">
            {spec.milestones.map((milestone, index) => (
              <div key={index} className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-102 ${
                completedMilestones.includes(index) 
                  ? darkMode
                    ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20' 
                    : 'bg-green-50 border-2 border-green-200'
                  : darkMode
                    ? 'hover:bg-slate-700/50 border-2 border-transparent hover:border-emerald-400/30 backdrop-blur-sm'
                    : 'hover:bg-gray-50 border-2 border-transparent'
              }`}>
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  completedMilestones.includes(index)
                    ? darkMode
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-green-500 text-white'
                    : darkMode
                      ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-200'
                      : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {completedMilestones.includes(index) ? (
                    <CheckCircle size={20} />
                  ) : (
                    <span className="text-sm font-semibold">W{milestone.week}</span>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className={`font-semibold ${
                    completedMilestones.includes(index) 
                      ? darkMode ? 'text-emerald-300' : 'text-green-800'
                      : darkMode ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    {milestone.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>{milestone.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      completedMilestones.includes(index)
                        ? darkMode
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-green-100 text-green-800'
                        : darkMode
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Trophy className="mr-1" size={12} />
                      {milestone.target}
                    </div>
                    {!completedMilestones.includes(index) && (
                      <button
                        onClick={() => markMilestoneComplete(index)}
                        className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                          darkMode 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}