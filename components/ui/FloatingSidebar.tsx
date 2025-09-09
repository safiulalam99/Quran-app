'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  isActive?: boolean;
}

interface FloatingSidebarProps {
  currentModule: string;
  onModuleChange: (moduleId: string) => void;
}

const modules: Module[] = [
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

export default function FloatingSidebar({ currentModule, onModuleChange }: FloatingSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const handleModuleSelect = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.isActive) {
      onModuleChange(moduleId);
      setIsOpen(false);
      
      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  };

  const getCurrentModule = () => {
    return modules.find(m => m.id === currentModule);
  };

  return (
    <>
      {/* Floating Menu Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed top-6 left-6 md:top-24 md:left-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600' 
            : 'bg-white hover:bg-gray-50 border border-gray-200'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 90 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{
          boxShadow: theme === 'dark' 
            ? '0 10px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.04)'
            : '0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
        >
          <path 
            d="M3 12h18m-9-9v18" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
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
                    onClick={() => setIsOpen(false)}
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
              {modules.map((module, index) => (
                <motion.button
                  key={module.id}
                  onClick={() => handleModuleSelect(module.id)}
                  disabled={!module.isActive}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 relative overflow-hidden ${
                    currentModule === module.id
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
                  {currentModule === module.id && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-20`}
                      layoutId="activeModule"
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <div className="flex items-center space-x-4 relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      currentModule === module.id 
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
                        currentModule === module.id ? 'text-white' : ''
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
              ))}

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