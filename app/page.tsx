'use client';

import { useState } from 'react';
import arabicAlphabet from './data/arabic-alphabet.json';
import AlphabetGrid from '../components/ui/AlphabetGrid';
import AppHeader from '../components/ui/AppHeader';
import LottieBackground from '../components/ui/LottieBackground';
import Navigation from '../components/ui/Navigation';
import QuizGame from '../components/quiz/QuizGame';
import StatsScreen from '../components/quiz/StatsScreen';

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

  const handleLetterPlay = () => {
    // Add haptic feedback for mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleModeChange = (mode: 'learn' | 'quiz' | 'stats') => {
    setCurrentMode(mode);
  };

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
    setCurrentMode('stats');
  };

  const handlePlayAgain = () => {
    setCurrentMode('quiz');
    setQuizStats(null);
  };

  const handleBackToMenu = () => {
    setCurrentMode('learn');
    setQuizStats(null);
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
        return (
          <QuizGame
            letters={alphabet}
            onQuizComplete={handleQuizComplete}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {currentMode === 'learn' && <LottieBackground animationType="floating-stars" />}
      
      <Navigation currentMode={currentMode} onModeChange={handleModeChange} />
      
      <div className={`${currentMode === 'learn' ? 'p-4' : ''} pb-24 md:pb-4 md:pt-20`}>
        {renderContent()}
      </div>
    </div>
  );
}
