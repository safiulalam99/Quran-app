'use client';

import { useState } from 'react';
import arabicAlphabet from './data/arabic-alphabet.json';
import AlphabetGrid from '../components/ui/AlphabetGrid';
import AppHeader from '../components/ui/AppHeader';
import LottieBackground from '../components/ui/LottieBackground';
import Navigation from '../components/ui/Navigation';
import QuizGame from '../components/quiz/QuizGame';
import QuizStartScreen from '../components/quiz/QuizStartScreen';
import StatsScreen from '../components/quiz/StatsScreen';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

export default function Home() {
  const { alphabet } = arabicAlphabet;
  const [currentMode, setCurrentMode] = useState<'learn' | 'quiz' | 'stats'>('learn');
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const { theme } = useTheme();

  const handleLetterPlay = () => {
    // Add haptic feedback for mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleModeChange = (mode: 'learn' | 'quiz' | 'stats') => {
    setCurrentMode(mode);
    // Reset quiz state when changing modes
    if (mode !== 'quiz') {
      setIsQuizStarted(false);
    }
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
  };

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
    setCurrentMode('stats');
  };

  const handlePlayAgain = () => {
    setCurrentMode('quiz');
    setQuizStats(null);
    setIsQuizStarted(false); // Go back to start screen
  };

  const handleBackToMenu = () => {
    setCurrentMode('learn');
    setQuizStats(null);
    setIsQuizStarted(false);
  };

  const renderContent = () => {
    switch (currentMode) {
      case 'learn':
        return (
          <>
            <AppHeader
              title="Arabic Alphabet"
              subtitle="🎵 Tap a letter to hear its sound"
              showProgress={false}
            />
            {/* Theme Toggle */}
            <div className="absolute top-24 right-4 z-20">
              <ThemeToggle />
            </div>
            <main className="pb-8 relative z-10">
              <div className="flex justify-center">
                <AlphabetGrid
                  letters={alphabet}
                  cols={{ mobile: 2, tablet: 4, desktop: 5 }}
                  onLetterPlay={handleLetterPlay}
                />
              </div>
            </main>
          </>
        );
      
      case 'quiz':
        return isQuizStarted ? (
          <QuizGame
            letters={alphabet}
            onQuizComplete={handleQuizComplete}
            onBackToMenu={handleBackToMenu}
          />
        ) : (
          <QuizStartScreen
            onStartQuiz={handleStartQuiz}
            onBackToMenu={handleBackToMenu}
          />
        );
      
      case 'stats':
        return quizStats ? (
          <StatsScreen
            stats={quizStats}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Stats Yet</h2>
              <p className="text-gray-600 mb-6">Take a quiz to see your progress!</p>
              <button
                onClick={() => setCurrentMode('quiz')}
                className="bg-[#58CC02] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#89E219] transition-colors"
              >
                Start Quiz
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Force quiz and stats to always use dark mode
  const getBackgroundClass = () => {
    if (currentMode === 'quiz') return 'bg-slate-800';
    if (currentMode === 'stats') return 'bg-slate-800';
    return theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} relative overflow-hidden`}>
      {currentMode === 'learn' && <LottieBackground animationType="floating-stars" />}
      
      <Navigation currentMode={currentMode} onModeChange={handleModeChange} />
      
      <div className={`${currentMode === 'learn' ? 'p-4' : ''} pb-24 md:pb-4 md:pt-20`}>
        {renderContent()}
      </div>
    </div>
  );
}
