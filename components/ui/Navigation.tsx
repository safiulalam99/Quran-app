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
    'alphabet-1': { bestScore: 89, attempts: 2 },
    'alphabet-2': { bestScore: 94, attempts: 1 },
    'alphabet-3': { bestScore: 76, attempts: 3 },
    'forms-recognition': { bestScore: 78, attempts: 2 },
    'position-quiz': { bestScore: 85, attempts: 1 },
    'connection-quiz': { bestScore: 92, attempts: 1 },
    'form-matching': { bestScore: 88, attempts: 2 },
    'word-building': { bestScore: 91, attempts: 1 },
    'form-sequence': { bestScore: 87, attempts: 2 },
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
            id: 'alphabet-1',
            name: 'Alphabet Quiz 1',
            route: '/quiz/alphabet-1',
            isActive: true,
            ...getQuizScore('alphabet-1')
          },
          {
            id: 'alphabet-2',
            name: 'Alphabet Quiz 2',
            route: '/quiz/alphabet-2',
            isActive: true,
            ...getQuizScore('alphabet-2')
          },
          {
            id: 'alphabet-3',
            name: 'Alphabet Quiz 3',
            route: '/quiz/alphabet-3',
            isActive: true,
            ...getQuizScore('alphabet-3')
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
            isActive: true,
            ...getQuizScore('forms-recognition')
          },
          {
            id: 'position-quiz',
            name: 'Position Quiz',
            route: '/quiz/positions',
            isActive: true,
            ...getQuizScore('position-quiz')
          },
          {
            id: 'connection-quiz',
            name: 'Connection Rules',
            route: '/quiz/connections',
            isActive: true,
            ...getQuizScore('connection-quiz')
          },
          {
            id: 'form-matching',
            name: 'Form Matching',
            route: '/quiz/form-matching',
            isActive: true,
            ...getQuizScore('form-matching')
          },
          {
            id: 'word-building',
            name: 'Word Building',
            route: '/quiz/word-building',
            isActive: true,
            ...getQuizScore('word-building')
          },
          {
            id: 'form-sequence',
            name: 'Form Sequence',
            route: '/quiz/form-sequence',
            isActive: true,
            ...getQuizScore('form-sequence')
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
                      <h3 className={`font-semibold text-lg ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {unit.name}
                      </h3>
                    </div>

                    {/* Lessons and Quizzes Container */}
                    <div className="space-y-3">
                        {unit.lessons.map((lesson, lessonIndex) => {
                          const isCurrentLesson = lesson.route === currentPath;

                          return (
                            <div key={lesson.id} className={`relative rounded-xl border backdrop-blur-sm ${
                              theme === 'dark'
                                ? 'bg-slate-800/50 border-slate-700'
                                : 'bg-white/70 border-gray-200 shadow-sm'
                            }`}>
                              {/* Lesson Card */}
                              <motion.button
                                onClick={() => handleNavigate(lesson.route)}
                                disabled={!lesson.isActive}
                                className={`w-full text-left px-4 py-4 rounded-t-xl transition-all duration-200 group relative overflow-hidden ${
                                  isCurrentLesson
                                    ? 'bg-gradient-to-r from-[#58CC02] to-[#4ade80] text-white shadow-lg'
                                    : lesson.isActive
                                      ? theme === 'dark'
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-sm hover:shadow-md'
                                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-800 shadow-sm hover:shadow-md'
                                      : theme === 'dark'
                                        ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + unitIndex * 0.1 + lessonIndex * 0.05 }}
                                whileHover={lesson.isActive ? { scale: 1.01 } : {}}
                                whileTap={lesson.isActive ? { scale: 0.98 } : {}}
                              >
                                {/* Subtle shine effect for active lessons */}
                                {lesson.isActive && !isCurrentLesson && (
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.6 }}
                                  />
                                )}

                                <div className="flex items-center justify-between relative z-10">
                                  <div className="flex items-center space-x-3">
                                    {/* Enhanced status indicator */}
                                    <div className={`w-3 h-3 rounded-full border-2 ${
                                      isCurrentLesson
                                        ? 'bg-white border-white'
                                        : lesson.isActive
                                          ? 'bg-[#58CC02] border-[#58CC02]'
                                          : theme === 'dark' ? 'bg-slate-600 border-slate-600' : 'bg-gray-300 border-gray-300'
                                    }`} />
                                    <span className="font-semibold text-base">{lesson.name}</span>
                                  </div>

                                  {/* Enhanced arrow for active lessons */}
                                  {lesson.isActive && (
                                    <div className={`p-1 rounded-full ${
                                      isCurrentLesson
                                        ? 'bg-white/20'
                                        : theme === 'dark'
                                          ? 'bg-slate-600 group-hover:bg-slate-500'
                                          : 'bg-blue-100 group-hover:bg-blue-200'
                                    }`}>
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className={`transition-transform group-hover:translate-x-1 ${
                                          isCurrentLesson ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-blue-600'
                                        }`}
                                      >
                                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </motion.button>

                              {/* Quiz Items for this lesson */}
                              {lesson.quizzes.length > 0 && (
                                <div className={`border-t px-3 py-3 space-y-2 rounded-b-xl ${
                                  theme === 'dark'
                                    ? 'border-slate-700 bg-slate-900/30'
                                    : 'border-gray-200 bg-gray-50/50'
                                }`}>
                                  {lesson.quizzes.map((quiz, quizIndex) => {
                                    const isCurrentQuiz = quiz.route === currentPath;

                                    return (
                                      <motion.button
                                        key={quiz.id}
                                        onClick={() => handleNavigate(quiz.route)}
                                        disabled={!quiz.isActive}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group relative min-h-[52px] ${
                                          isCurrentQuiz
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                            : quiz.isActive
                                              ? theme === 'dark'
                                                ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-sm hover:shadow-md'
                                                : 'bg-white hover:bg-orange-50 text-gray-700 shadow-sm hover:shadow-md border border-orange-100'
                                              : theme === 'dark'
                                                ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 + unitIndex * 0.1 + lessonIndex * 0.05 + quizIndex * 0.02 }}
                                        whileHover={quiz.isActive ? { scale: 1.02 } : {}}
                                        whileTap={quiz.isActive ? { scale: 0.98 } : {}}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            {/* Enhanced Quiz icon */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                              isCurrentQuiz
                                                ? 'bg-white/20'
                                                : quiz.isActive
                                                  ? theme === 'dark'
                                                    ? 'bg-slate-600'
                                                    : 'bg-orange-100'
                                                  : theme === 'dark'
                                                    ? 'bg-slate-700'
                                                    : 'bg-gray-200'
                                            }`}>
                                              <span className={`text-lg ${
                                                isCurrentQuiz
                                                  ? 'text-white'
                                                  : quiz.isActive
                                                    ? theme === 'dark' ? 'text-white' : 'text-orange-600'
                                                    : 'text-gray-400'
                                              }`}>
                                                🧠
                                              </span>
                                            </div>

                                            <div className="flex flex-col">
                                              <span className="font-semibold text-base">{quiz.name}</span>
                                              {!quiz.isActive && (
                                                <span className={`text-xs px-2 py-1 rounded-full mt-1 w-fit ${
                                                  theme === 'dark' ? 'bg-slate-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                  Coming Soon
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Enhanced Score display */}
                                          <div className="flex flex-col items-end space-y-1">
                                            {quiz.bestScore && quiz.isActive && (
                                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                                                isCurrentQuiz
                                                  ? 'bg-white/20 text-white'
                                                  : theme === 'dark'
                                                    ? 'bg-slate-600 text-gray-200'
                                                    : 'bg-orange-100 text-orange-700'
                                              }`}>
                                                <span className="text-sm">{getScoreIcon(quiz.bestScore)}</span>
                                                <span className="font-bold text-sm">
                                                  {quiz.bestScore}%
                                                </span>
                                              </div>
                                            )}
                                            {quiz.attempts && quiz.attempts > 1 && (
                                              <div className={`text-xs ${
                                                isCurrentQuiz
                                                  ? 'text-white/70'
                                                  : theme === 'dark' ? 'text-gray-400' : 'text-orange-600'
                                              }`}>
                                                {quiz.attempts} tries
                                              </div>
                                            )}
                                          </div>
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