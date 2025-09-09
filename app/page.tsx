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
import FloatingSidebar from '../components/ui/FloatingSidebar';
import ArabicFormsPage from '../components/forms/ArabicFormsPage';
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
  const [currentModule, setCurrentModule] = useState<'learn' | 'forms' | 'quiz'>('learn');
  const [currentMode, setCurrentMode] = useState<'learn' | 'quiz'>('learn');
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const { theme } = useTheme();

  const handleLetterPlay = () => {
    // Add haptic feedback for mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleModuleChange = (moduleId: string) => {
    setCurrentModule(moduleId as 'learn' | 'forms' | 'quiz');
    
    // Handle legacy mode changes for existing components
    if (moduleId === 'learn' || moduleId === 'quiz') {
      setCurrentMode(moduleId as 'learn' | 'quiz');
    }
    
    // Reset quiz state when changing modules
    if (moduleId !== 'quiz') {
      setIsQuizStarted(false);
    }
  };

  const handleModeChange = (mode: 'learn' | 'quiz') => {
    setCurrentMode(mode);
    setCurrentModule(mode);
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
    // Show stats screen temporarily, then auto-return to learn mode
    setTimeout(() => {
      setCurrentMode('learn');
      setQuizStats(null);
      setIsQuizStarted(false);
    }, 5000); // Show stats for 5 seconds then return to learn
  };

  const handlePlayAgain = () => {
    setCurrentMode('quiz');
    setQuizStats(null);
    setIsQuizStarted(false); // Go back to start screen
  };

  const handleBackToMenu = () => {
    setCurrentMode('learn');
    setCurrentModule('learn');
    setQuizStats(null);
    setIsQuizStarted(false);
  };

  const renderContent = () => {
    // Show stats screen if quiz was completed
    if (quizStats) {
      return (
        <StatsScreen
          stats={quizStats}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      );
    }

    switch (currentModule) {
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
      
      case 'forms':
        return <ArabicFormsPage />;
      
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
      
      default:
        return null;
    }
  };

  // Use theme consistently across all modes
  const getBackgroundClass = () => {
    return theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} relative overflow-hidden`}>
      {currentModule === 'learn' && <LottieBackground animationType="floating-stars" />}
      
      {/* Floating Sidebar Navigation */}
      <FloatingSidebar 
        currentModule={currentModule}
        onModuleChange={handleModuleChange}
      />
      
      {/* Legacy Navigation for Learn/Quiz modes only */}
      {(currentModule === 'learn' || currentModule === 'quiz') && (
        <Navigation currentMode={currentMode} onModeChange={handleModeChange} />
      )}
      
      <div className={`${currentModule === 'learn' ? 'p-4' : ''} ${
        (currentModule === 'learn' || currentModule === 'quiz') ? 'pb-24 md:pb-4 md:pt-20' : ''
      }`}>
        {renderContent()}
      </div>
    </div>
  );
}
