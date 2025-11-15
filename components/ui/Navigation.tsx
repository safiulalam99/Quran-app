'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { getQuizStats } from '../../utils/statsStorage';

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

// Get real quiz scores from localStorage
const useQuizScores = () => {
  const [scores, setScores] = useState<Record<string, { bestScore: number; attempts: number }>>({});

  useEffect(() => {
    // Load all quiz scores
    const quizIds = [
      'alphabet-1', 'alphabet-2', 'alphabet-3',
      'forms-recognition', 'position-quiz', 'connection-quiz',
      'form-matching', 'word-building', 'form-sequence'
    ];

    const loadedScores: Record<string, { bestScore: number; attempts: number }> = {};
    quizIds.forEach(quizId => {
      loadedScores[quizId] = getQuizStats(quizId);
    });

    setScores(loadedScores);
  }, []);

  return scores;
};

// Base units structure without scores (scores added dynamically from localStorage)
const unitsConfig: Unit[] = [
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
            id: 'alphabet-1',
            name: 'Alphabet Quiz 1',
            route: '/quiz/alphabet-1',
            isActive: true
          },
          {
            id: 'alphabet-2',
            name: 'Alphabet Quiz 2',
            route: '/quiz/alphabet-2',
            isActive: true
          },
          {
            id: 'alphabet-3',
            name: 'Alphabet Quiz 3',
            route: '/quiz/alphabet-3',
            isActive: true
          }
        ]
      },
      {
        id: 'learn-fatha',
        name: 'Learn Fatha',
        route: '/fatha',
        isActive: true,
        quizzes: []
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
            isActive: true
          },
          {
            id: 'position-quiz',
            name: 'Position Quiz',
            route: '/quiz/positions',
            isActive: true
          },
          {
            id: 'connection-quiz',
            name: 'Connection Rules',
            route: '/quiz/connections',
            isActive: true
          },
          {
            id: 'form-matching',
            name: 'Form Matching',
            route: '/quiz/form-matching',
            isActive: true
          },
          {
            id: 'word-building',
            name: 'Word Building',
            route: '/quiz/word-building',
            isActive: true
          },
          {
            id: 'form-sequence',
            name: 'Form Sequence',
            route: '/quiz/form-sequence',
            isActive: true
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
            id: 'word-building-words',
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
  const quizScores = useQuizScores();

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Merge quiz scores with units config
  const units = unitsConfig.map(unit => ({
    ...unit,
    lessons: unit.lessons.map(lesson => ({
      ...lesson,
      quizzes: lesson.quizzes.map(quiz => ({
        ...quiz,
        ...quizScores[quiz.id]
      }))
    }))
  }));

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
      {/* Desktop Navigation - Top Fixed */}
      <nav className={`hidden md:block fixed top-0 left-0 right-0 w-full backdrop-blur-md z-50 ${
        theme === 'dark'
          ? 'bg-slate-800/90 border-b border-slate-600'
          : 'bg-white/90 border-b border-gray-200'
      }`}>
        <div className="flex justify-between items-center py-4 px-6">
          {/* Hamburger Menu Button for Desktop */}
          <motion.button
            onClick={handleMenuToggle}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
              theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-5 h-0.5 bg-current rounded-full"></div>
              <div className="w-5 h-0.5 bg-current rounded-full"></div>
              <div className="w-5 h-0.5 bg-current rounded-full"></div>
            </div>
          </motion.button>

          {/* Quiz Button */}
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`
                  relative px-4 py-3 rounded-lg font-medium text-sm
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
                <span className="relative z-10 text-sm font-medium">{tab.label}</span>
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
            <div className="flex-1 p-4 space-y-8 overflow-y-auto">
              {units.map((unit, unitIndex) => {
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

                return (
                  <div key={unit.id} className="relative">
                    {/* Unit Header - Non-clickable Section Label */}
                    <div className={`flex items-center space-x-3 mb-4 pb-2 border-b-2 ${
                      theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${unit.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-xl">{unit.icon}</span>
                      </div>
                      <h3 className={`font-bold text-xl uppercase tracking-wide ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {unit.name}
                      </h3>
                    </div>

                    {/* Lessons and Quizzes */}
                    <div className="space-y-4 pl-2">
                        {unit.lessons.map((lesson, lessonIndex) => {
                          const isCurrentLesson = lesson.route === currentPath;

                          return (
                            <div key={lesson.id} className="space-y-2">
                              {/* Lesson Button - Direct Navigation */}
                              <motion.button
                                onClick={() => handleNavigate(lesson.route)}
                                disabled={!lesson.isActive}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                                  isCurrentLesson
                                    ? 'bg-gradient-to-r from-[#58CC02] to-[#4ade80] text-white shadow-lg'
                                    : lesson.isActive
                                      ? theme === 'dark'
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-sm hover:shadow-md'
                                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-800 shadow-sm hover:shadow-md border border-blue-200'
                                      : theme === 'dark'
                                        ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
                                }`}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + unitIndex * 0.1 + lessonIndex * 0.05 }}
                                whileHover={lesson.isActive ? { scale: 1.02 } : {}}
                                whileTap={lesson.isActive ? { scale: 0.98 } : {}}
                              >
                                <div className="flex items-center justify-between relative z-10">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xl">📖</span>
                                    <span className="font-bold text-base">{lesson.name}</span>
                                  </div>

                                  {lesson.isActive && (
                                    <svg
                                      width="18"
                                      height="18"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      className={`transition-transform group-hover:translate-x-1 ${
                                        isCurrentLesson ? 'text-white' : theme === 'dark' ? 'text-gray-400' : 'text-blue-600'
                                      }`}
                                    >
                                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                              </motion.button>

                              {/* Quiz Items - Always Visible */}
                              {lesson.quizzes.length > 0 && (
                                <div className="pl-6 space-y-2">
                                  {lesson.quizzes.map((quiz, quizIndex) => {
                                    const isCurrentQuiz = quiz.route === currentPath;

                                    return (
                                      <motion.button
                                        key={quiz.id}
                                        onClick={() => handleNavigate(quiz.route)}
                                        disabled={!quiz.isActive}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                                          isCurrentQuiz
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                            : quiz.isActive
                                              ? theme === 'dark'
                                                ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm hover:shadow-md'
                                                : 'bg-white hover:bg-orange-50 text-gray-700 shadow-sm hover:shadow-md border border-gray-200 hover:border-orange-200'
                                              : theme === 'dark'
                                                ? 'bg-slate-900 text-gray-600 cursor-not-allowed'
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                        }`}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.15 + unitIndex * 0.1 + lessonIndex * 0.05 + quizIndex * 0.03 }}
                                        whileHover={quiz.isActive ? { scale: 1.02, x: 2 } : {}}
                                        whileTap={quiz.isActive ? { scale: 0.98 } : {}}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2.5">
                                            <span className={`text-base ${
                                              isCurrentQuiz ? 'text-white' : quiz.isActive ? 'opacity-80' : 'opacity-50'
                                            }`}>
                                              🧠
                                            </span>
                                            <span className="font-medium text-sm">{quiz.name}</span>
                                          </div>

                                          {/* Score Display */}
                                          {quiz.bestScore && quiz.bestScore > 0 && quiz.isActive && (
                                            <div className="flex items-center space-x-1.5">
                                              <span className="text-xs">{getScoreIcon(quiz.bestScore)}</span>
                                              <span className="font-bold text-xs">{quiz.bestScore}%</span>
                                            </div>
                                          )}
                                        </div>
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
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