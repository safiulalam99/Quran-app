'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  currentMode: 'learn' | 'quiz';
  onModeChange: (mode: 'learn' | 'quiz') => void;
}

const modules = [
  {
    id: 'learn',
    name: 'Learn Letters',
    icon: '📚',
    description: 'Tap letters to hear sounds!',
    color: 'from-blue-500 to-cyan-500',
    isActive: true
  },
  {
    id: 'forms',
    name: 'Letter Shapes',
    icon: '✏️',
    description: 'See how letters change!',
    color: 'from-purple-500 to-pink-500',
    isActive: true
  },
  {
    id: 'quiz',
    name: 'Fun Quiz',
    icon: '🎯',
    description: 'Play and test yourself!',
    color: 'from-green-500 to-emerald-500',
    isActive: true
  }
];

export default function Navigation({ currentMode, onModeChange }: NavigationProps) {
  const [activeTab, setActiveTab] = useState(currentMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleModuleSelect = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.isActive) {
      // Navigate to proper routes
      if (moduleId === 'forms') {
        window.location.href = '/forms';
      } else if (moduleId === 'quiz') {
        window.location.href = '/quiz';
      } else if (moduleId === 'learn') {
        window.location.href = '/';
      }
      
      setIsMenuOpen(false);
      
      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  };

  const getCurrentModule = () => {
    // Determine current module based on current path
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/forms') return modules.find(m => m.id === 'forms');
      if (path === '/quiz') return modules.find(m => m.id === 'quiz');
      return modules.find(m => m.id === 'learn');
    }
    return modules.find(m => m.id === 'learn');
  };

  const tabs = [
    {
      id: 'quiz',
      label: 'Quiz',
      icon: '✨',
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
        <div className="flex justify-center py-1">
          <div className="flex space-x-1">
              {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`
                  relative px-1.5 py-0.5 rounded font-medium text-xs
                  transition-all duration-200 flex items-center space-x-1
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
                <span className="relative z-10 text-xs">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md z-50 ${
        theme === 'dark'
          ? 'bg-slate-800/90 border-t border-slate-600'
          : 'bg-white/90 border-t border-gray-200'
      }`}>
        <div className="flex justify-around items-center py-0.5 px-4">
          {/* Hamburger Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center p-2 rounded transition-all duration-200 ${
              theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-5 h-0.5 bg-current rounded-full"></div>
              <div className="w-5 h-0.5 bg-current rounded-full"></div>
              <div className="w-5 h-0.5 bg-current rounded-full"></div>
            </div>
            <span className="text-xs font-medium mt-1">Menu</span>
          </motion.button>

          {/* Quiz Button */}
          {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`
                  relative flex flex-col items-center justify-center p-1 rounded
                  transition-all duration-200 min-w-[50px]
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
                  className="relative z-10 text-sm mb-0.5"
                  animate={{
                    scale: activeTab === tab.id ? 1.05 : 1,
                  }}
                >
                  {tab.icon}
                </motion.span>
                <span className="relative z-10 text-[10px] font-medium">{tab.label}</span>
              </motion.button>
            ))}
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`fixed left-0 top-0 h-full w-80 z-50 shadow-2xl flex flex-col ${
              theme === 'dark' 
                ? 'bg-slate-800 border-r border-slate-700' 
                : 'bg-white border-r border-gray-200'
            }`}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4
            }}
          >
            {/* Header */}
            <div className={`flex-shrink-0 p-6 border-b ${
              theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Let's Learn!
                </h2>
                <div className="flex items-center space-x-3">
                  <ThemeToggle />
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Current Module */}
              {getCurrentModule() && (
                <motion.div
                  className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getCurrentModule()?.color} flex items-center justify-center`}>
                      <span className="text-lg">{getCurrentModule()?.icon}</span>
                    </div>
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Now Playing: {getCurrentModule()?.name}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {getCurrentModule()?.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Module List */}
            <div className="flex-1 p-6 space-y-3 overflow-y-auto">
              {modules.map((module, index) => {
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
                const isCurrentModule = 
                  (module.id === 'learn' && currentPath === '/') ||
                  (module.id === 'forms' && currentPath === '/forms') ||
                  (module.id === 'quiz' && currentPath === '/quiz');

                return (
                  <motion.button
                    key={module.id}
                    onClick={() => handleModuleSelect(module.id)}
                    disabled={!module.isActive}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 relative overflow-hidden ${
                      isCurrentModule
                        ? theme === 'dark'
                          ? 'bg-[#58CC02] text-white shadow-lg'
                          : 'bg-[#58CC02] text-white shadow-lg'
                        : module.isActive
                          ? theme === 'dark'
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                          : theme === 'dark'
                            ? 'bg-slate-900 text-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={module.isActive ? { scale: 1.02 } : {}}
                    whileTap={module.isActive ? { scale: 0.98 } : {}}
                  >
                    {/* Background gradient for active item */}
                    {isCurrentModule && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-20`}
                        layoutId="activeModule"
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    <div className="flex items-center space-x-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCurrentModule 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-r ${module.color}`
                      }`}>
                        <span className="text-xl">{module.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">
                          <span>{module.name}</span>
                        </div>
                        <div className={`text-sm opacity-75 ${
                          isCurrentModule ? 'text-white' : ''
                        }`}>
                          {module.description}
                        </div>
                      </div>
                      {module.isActive && (
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none"
                          className="opacity-50"
                        >
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </motion.button>
                );
              })}

              {/* Fun footer */}
              <motion.div
                className={`mt-8 p-4 rounded-xl text-center text-sm ${
                  theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-50 text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">🌟</span>
                  <span className="font-medium">Have fun learning!</span>
                  <span className="text-lg">🎉</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}