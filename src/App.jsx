import React, { useState } from 'react';
import DreamGenerator from './components/DreamGenerator';
import DreamApp from './components/DreamApp';
import InteractiveDemo from './components/InteractiveDemo';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [currentApp, setCurrentApp] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const handleGenerateApp = (spec) => {
    setCurrentApp(spec);
    setDemoMode(true); // Enable demo mode for new apps
  };

  const handleBackToGenerator = () => {
    setCurrentApp(null);
    setDemoMode(false);
  };

  const handleDemoProgressUpdate = (progress) => {
    // This would update the DreamApp component's progress
    // For now, we'll let the DreamApp handle its own state
  };

  return (
    <div className="App">
      {currentApp ? (
        <div>
          <div className="fixed top-4 left-4 z-10">
            <button
              onClick={handleBackToGenerator}
              className="flex items-center space-x-2 bg-white shadow-lg rounded-full px-4 py-2 hover:shadow-xl transition-shadow"
            >
              <ArrowLeft size={20} />
              <span>New Dream</span>
            </button>
          </div>
          <DreamApp spec={currentApp} />
          {demoMode && (
            <InteractiveDemo 
              spec={currentApp} 
              onProgressUpdate={handleDemoProgressUpdate}
            />
          )}
        </div>
      ) : (
        <DreamGenerator onGenerateApp={handleGenerateApp} />
      )}
    </div>
  );
}

export default App;