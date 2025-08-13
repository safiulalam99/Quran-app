'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavigationProps {
  currentMode: 'learn' | 'quiz' | 'stats';
  onModeChange: (mode: 'learn' | 'quiz' | 'stats') => void;
}

export default function Navigation({ currentMode, onModeChange }: NavigationProps) {
  const [activeTab, setActiveTab] = useState(currentMode);

  const handleTabChange = (mode: 'learn' | 'quiz' | 'stats') => {
    setActiveTab(mode);
    onModeChange(mode);
    
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
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: '📊',
      color: 'from-[#58CC02] to-[#89E219]'
    }
  ];

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:block w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-center space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`
                  relative px-6 py-3 rounded-xl font-semibold text-sm
                  transition-all duration-200 flex items-center space-x-2
                  ${activeTab === tab.id 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                    layoutId="activeTabDesktop"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 text-xl">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-xl
                transition-all duration-200 min-w-[80px]
                ${activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-gray-600'
                }
              `}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                  layoutId="activeTabMobile"
                  transition={{ duration: 0.3 }}
                />
              )}
              <motion.span 
                className="relative z-10 text-2xl mb-1"
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
      </nav>
    </>
  );
}