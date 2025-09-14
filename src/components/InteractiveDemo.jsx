import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

export default function InteractiveDemo({ spec, onProgressUpdate }) {
  const [isRunning, setIsRunning] = useState(false);
  const [demoProgress, setDemoProgress] = useState({});

  useEffect(() => {
    // Initialize demo progress
    const initialProgress = {};
    spec.trackers.forEach(tracker => {
      initialProgress[tracker.name] = 0;
    });
    setDemoProgress(initialProgress);
  }, [spec]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setDemoProgress(prev => {
          const updated = { ...prev };
          spec.trackers.forEach(tracker => {
            const increment = Math.random() * (tracker.target * 0.02); // 2% of target
            updated[tracker.name] = Math.min(
              tracker.target,
              (updated[tracker.name] || 0) + increment
            );
          });
          
          // Update parent component
          onProgressUpdate(updated);
          return updated;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, spec, onProgressUpdate]);

  const resetDemo = () => {
    const resetProgress = {};
    spec.trackers.forEach(tracker => {
      resetProgress[tracker.name] = 0;
    });
    setDemoProgress(resetProgress);
    onProgressUpdate(resetProgress);
    setIsRunning(false);
  };

  const simulateWorkout = () => {
    if (spec.category === 'fitness') {
      const updates = {};
      spec.trackers.forEach(tracker => {
        if (tracker.name.includes('Miles')) {
          updates[tracker.name] = (demoProgress[tracker.name] || 0) + Math.random() * 5 + 2;
        } else if (tracker.name.includes('Days')) {
          updates[tracker.name] = (demoProgress[tracker.name] || 0) + 1;
        }
      });
      setDemoProgress(prev => ({ ...prev, ...updates }));
      onProgressUpdate({ ...demoProgress, ...updates });
    }
  };

  const simulateStudy = () => {
    if (spec.category === 'learning') {
      const updates = {};
      spec.trackers.forEach(tracker => {
        if (tracker.name.includes('Words')) {
          updates[tracker.name] = (demoProgress[tracker.name] || 0) + Math.floor(Math.random() * 20 + 10);
        } else if (tracker.name.includes('Hours')) {
          updates[tracker.name] = (demoProgress[tracker.name] || 0) + Math.random() * 2 + 0.5;
        }
      });
      setDemoProgress(prev => ({ ...prev, ...updates }));
      onProgressUpdate({ ...demoProgress, ...updates });
    }
  };

  const simulateWriting = () => {
    if (spec.category === 'writing') {
      const updates = {};
      spec.trackers.forEach(tracker => {
        if (tracker.name.includes('Words')) {
          updates[tracker.name] = (demoProgress[tracker.name] || 0) + Math.floor(Math.random() * 500 + 200);
        } else if (tracker.name.includes('Days')) {
          updates[tracker.name] = (demoProgress[tracker.name] || 0) + 1;
        }
      });
      setDemoProgress(prev => ({ ...prev, ...updates }));
      onProgressUpdate({ ...demoProgress, ...updates });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl p-4 border-2 border-indigo-200 z-30">
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="text-indigo-600" size={20} />
        <span className="font-semibold text-gray-900">Demo Controls</span>
      </div>
      
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRunning 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isRunning ? 'Pause' : 'Auto'}</span>
          </button>
          
          <button
            onClick={resetDemo}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

        {/* Category-specific quick actions */}
        <div className="flex flex-col space-y-1">
          {spec.category === 'fitness' && (
            <button
              onClick={simulateWorkout}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
            >
              🏃‍♂️ Log Workout
            </button>
          )}
          
          {spec.category === 'learning' && (
            <button
              onClick={simulateStudy}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              📚 Study Session
            </button>
          )}
          
          {spec.category === 'writing' && (
            <button
              onClick={simulateWriting}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              ✍️ Writing Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}