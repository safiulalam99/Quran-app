'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  currentMode: 'learn' | 'quiz';
  onModeChange: (mode: 'learn' | 'quiz') => void;
}

interface Quiz {
  id: string;
  name: string;
  route: string;
  isActive: boolean;
  bestScore?: number;
  attempts?: number;
}

interface Lesson {
  id: string;
  name: string;
  route: string;
  isActive: boolean;
  quizzes: Quiz[];
}

interface Unit {
  id: string;
  name: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

// Mock function to get quiz scores - replace with actual storage later
const getQuizScore = (quizId: string) => {
  const scores = {
    'letter-recognition': { bestScore: 85, attempts: 3 },
    'sound-matching': { bestScore: 92, attempts: 1 },
    'forms-recognition': { bestScore: 78, attempts: 2 },
  };
  return scores[quizId as keyof typeof scores];
};

const units: Unit[] = [
  {
    id: 'alphabet',
    name: 'Alphabet',
    icon: '📚',
    color: 'from-blue-500 to-cyan-500',
    lessons: [
      {
        id: 'learn-letters',
        name: 'Learn Letters',
        route: '/',
        isActive: true,
        quizzes: [
          {
            id: 'letter-recognition',
            name: 'Letter Recognition',
            route: '/quiz/letters',
            isActive: true,
            ...getQuizScore('letter-recognition')
          },
          {
            id: 'sound-matching',
            name: 'Sound Matching',
            route: '/quiz/sounds',
            isActive: false,
            ...getQuizScore('sound-matching')
          },
          {
            id: 'spelling',
            name: 'Spelling',
            route: '/quiz/spelling',
            isActive: false
          }
        ]
      },
      {
        id: 'letter-forms',
        name: 'Letter Forms',
        route: '/forms',
        isActive: true,
        quizzes: [
          {
            id: 'forms-recognition',
            name: 'Forms Recognition',
            route: '/quiz/forms',
            isActive: false,
            ...getQuizScore('forms-recognition')
          },
          {
            id: 'position-quiz',
            name: 'Position Quiz',
            route: '/quiz/positions',
            isActive: false
          }
        ]
      }
    ]
  },
  {
    id: 'words',
    name: 'Words',
    icon: '🔤',
    color: 'from-green-500 to-emerald-500',
    lessons: [
      {
        id: 'simple-words',
        name: 'Simple Words',
        route: '/words',
        isActive: false,
        quizzes: [
          {
            id: 'word-building',
            name: 'Word Building',
            route: '/quiz/words',
            isActive: false
          }
        ]
      }
    ]
  }
];

export default function Navigation({ currentMode, onModeChange }: NavigationProps) {
  const [activeTab, setActiveTab] = useState(currentMode);
  const { theme } = useTheme();
  
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleNavigate = (route: string) => {
    window.location.href = route;
    if (!isDesktop) {
      setIsMenuOpen(false);
    }
    
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '🎯';
    if (score >= 70) return '👍';
    return '💪';
  };


  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    if (!isDesktop) {
      setIsMenuOpen(false);
    }
  };

  const handleOverlayClick = () => {
    setIsMenuOpen(false);
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
        <div className="flex justify-between items-center py-1 px-4">
          {/* Hamburger Menu Button for Desktop */}
          <motion.button
            onClick={handleMenuToggle}
            className={`flex flex-col items-center justify-center p-2 rounded transition-all duration-200 ${
              theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-4 h-0.5 bg-current rounded-full"></div>
              <div className="w-4 h-0.5 bg-current rounded-full"></div>
              <div className="w-4 h-0.5 bg-current rounded-full"></div>
            </div>
          </motion.button>

          {/* Quiz Button */}
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
            onClick={handleMenuToggle}
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
            className={`fixed inset-0 z-40 ${
              isDesktop 
                ? 'bg-transparent' 
                : 'bg-black/50 backdrop-blur-sm'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleOverlayClick}
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex-shrink-0 p-4 border-b ${
              theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <motion.button
                  onClick={handleMenuClose}
                  className={`md:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
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

            {/* Units > Lessons > Quizzes */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
              {units.map((unit, unitIndex) => {
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
                
                return (
                  <div key={unit.id} className="relative">
                    {/* Unit Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${unit.color} flex items-center justify-center`}>
                        <span className="text-lg">{unit.icon}</span>
                      </div>
                      <h3 className={`font-bold text-lg ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {unit.name}
                      </h3>
                    </div>

                    {/* Vertical Line Container */}
                    <div className="relative ml-4">
                      {/* Main vertical line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-px ${
                        theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
                      }`} />
                      
                      {/* Lessons */}
                      <div className="space-y-4">
                        {unit.lessons.map((lesson, lessonIndex) => {
                          const isCurrentLesson = lesson.route === currentPath;
                          
                          return (
                            <div key={lesson.id} className="relative">
                              {/* Lesson */}
                              <div className="flex items-center space-x-3 pl-6">
                                {/* Lesson dot */}
                                <div className={`absolute left-0 w-2 h-2 rounded-full -translate-x-1/2 ${
                                  isCurrentLesson 
                                    ? 'bg-[#58CC02]' 
                                    : lesson.isActive
                                      ? theme === 'dark' ? 'bg-slate-400' : 'bg-gray-400'
                                      : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                                }`} />
                                
                                <motion.button
                                  onClick={() => handleNavigate(lesson.route)}
                                  disabled={!lesson.isActive}
                                  className={`text-left transition-all duration-200 ${
                                    isCurrentLesson
                                      ? 'text-[#58CC02] font-semibold'
                                      : lesson.isActive
                                        ? theme === 'dark'
                                          ? 'text-white hover:text-gray-300'
                                          : 'text-gray-800 hover:text-gray-600'
                                        : theme === 'dark'
                                          ? 'text-gray-600 cursor-not-allowed'
                                          : 'text-gray-400 cursor-not-allowed'
                                  }`}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 + unitIndex * 0.1 + lessonIndex * 0.05 }}
                                  whileHover={lesson.isActive ? { x: 2 } : {}}
                                >
                                  {lesson.name}
                                </motion.button>
                              </div>

                              {/* Quizzes for this lesson */}
                              {lesson.quizzes.length > 0 && (
                                <div className="mt-3 ml-6 space-y-2">
                                  {/* Quiz branch line */}
                                  <div className={`absolute left-0 w-4 h-px mt-3 ${
                                    theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
                                  }`} />
                                  
                                  {lesson.quizzes.map((quiz, quizIndex) => {
                                    const isCurrentQuiz = quiz.route === currentPath;
                                    
                                    return (
                                      <div key={quiz.id} className="relative flex items-center justify-between pl-6">
                                        {/* Quiz dot */}
                                        <div className={`absolute left-0 w-1.5 h-1.5 rounded-full -translate-x-1/2 ${
                                          isCurrentQuiz 
                                            ? 'bg-[#58CC02]' 
                                            : quiz.isActive
                                              ? theme === 'dark' ? 'bg-slate-500' : 'bg-gray-500'
                                              : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                                        }`} />
                                        
                                        <motion.button
                                          onClick={() => handleNavigate(quiz.route)}
                                          disabled={!quiz.isActive}
                                          className={`text-left transition-all duration-200 text-sm flex-1 ${
                                            isCurrentQuiz
                                              ? 'text-[#58CC02] font-medium'
                                              : quiz.isActive
                                                ? theme === 'dark'
                                                  ? 'text-gray-300 hover:text-white'
                                                  : 'text-gray-600 hover:text-gray-800'
                                                : theme === 'dark'
                                                  ? 'text-gray-600 cursor-not-allowed'
                                                  : 'text-gray-400 cursor-not-allowed'
                                          }`}
                                          initial={{ x: -15, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{ delay: 0.1 + unitIndex * 0.1 + lessonIndex * 0.05 + quizIndex * 0.02 }}
                                          whileHover={quiz.isActive ? { x: 2 } : {}}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <span>{quiz.name}</span>
                                            {!quiz.isActive && (
                                              <span className={`text-xs px-1.5 py-0.5 rounded text-xs ${
                                                theme === 'dark' ? 'bg-slate-700 text-gray-500' : 'bg-gray-200 text-gray-500'
                                              }`}>
                                                Soon
                                              </span>
                                            )}
                                          </div>
                                        </motion.button>
                                        
                                        {/* Score Display */}
                                        {quiz.bestScore && quiz.isActive && (
                                          <div className="flex items-center space-x-2 ml-3">
                                            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium ${
                                              isCurrentQuiz 
                                                ? 'text-[#58CC02]' 
                                                : theme === 'dark'
                                                  ? 'text-gray-400'
                                                  : 'text-gray-500'
                                            }`}>
                                              <span className="text-xs">{getScoreIcon(quiz.bestScore)}</span>
                                              <span className={`font-bold ${
                                                isCurrentQuiz ? 'text-[#58CC02]' : getScoreColor(quiz.bestScore)
                                              }`}>
                                                {quiz.bestScore}%
                                              </span>
                                            </div>
                                            {quiz.attempts && quiz.attempts > 1 && (
                                              <div className={`text-xs ${
                                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                              }`}>
                                                {quiz.attempts}x
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}