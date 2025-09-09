'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NavigationProps {
  currentMode: 'learn' | 'quiz';
  onModeChange: (mode: 'learn' | 'quiz') => void;
}

export default function Navigation({ currentMode, onModeChange }: NavigationProps) {
  const [activeTab, setActiveTab] = useState(currentMode);
  const { theme } = useTheme();

  const handleTabChange = (mode: 'learn' | 'quiz') => {
    setActiveTab(mode);
    
    // Navigate to proper routes
    if (mode === 'quiz') {
      window.location.href = '/quiz';
    } else if (mode === 'learn') {
      window.location.href = '/';
    } else {
      // Fallback to the old method
      onModeChange(mode);
    }
    
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const tabs = [
    {
      id: 'learn',
      label: 'Learn',
      icon: '📚',
      color: 'from-[#58CC02] to-[#89E219]'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: '🎯',
      color: 'from-[#58CC02] to-[#89E219]'
    }
  ];

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className={`hidden md:block w-full backdrop-blur-md sticky top-0 z-50 ${
        theme === 'dark' 
          ? 'bg-slate-800/80 border-b border-slate-600' 
          : 'bg-white/80 border-b border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex justify-center space-x-2 flex-1">
              {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`
                  relative px-4 py-2 rounded-lg font-semibold text-sm
                  transition-all duration-200 flex items-center space-x-2
                  ${activeTab === tab.id 
                    ? 'text-white shadow-lg' 
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-slate-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg`}
                    layoutId="activeTabDesktop"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 text-lg">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md z-50 ${
        theme === 'dark'
          ? 'bg-slate-800/90 border-t border-slate-600'
          : 'bg-white/90 border-t border-gray-200'
      }`}>
        <div className="flex justify-center items-center py-1 space-x-2">
          <div className="flex justify-around items-center flex-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`
                  relative flex flex-col items-center justify-center p-2 rounded-lg
                  transition-all duration-200 min-w-[70px]
                  ${activeTab === tab.id 
                    ? 'text-white' 
                    : theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }
                `}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg`}
                    layoutId="activeTabMobile"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <motion.span 
                  className="relative z-10 text-xl mb-1"
                  animate={{
                    scale: activeTab === tab.id ? 1.1 : 1,
                  }}
                >
                  {tab.icon}
                </motion.span>
                <span className="relative z-10 text-xs font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}