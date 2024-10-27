import React, { useEffect } from 'react';
import { Terminal, Coffee } from 'lucide-react';

const LoadingScreen = ({ onLoadingComplete }) => {
  useEffect(() => {
    // Simulate loading time (you can adjust this based on your needs)
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <div className="animate-bounce">
          <Terminal className="w-16 h-16 text-blue-400 mx-auto" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Establishing SSH Connection</h2>
          <div className="flex items-center justify-center space-x-2">
            <Coffee className="w-5 h-5 text-yellow-400 animate-pulse" />
            <p className="text-gray-400">Brewing your secure connection...</p>
          </div>
        </div>

        <div className="w-48 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-500 animate-progress rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;