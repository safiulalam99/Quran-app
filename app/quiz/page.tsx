'use client';

import { useState } from 'react';
import arabicAlphabet from '../data/arabic-alphabet.json';
import QuizGame from '../../components/quiz/QuizGame';
import QuizStartScreen from '../../components/quiz/QuizStartScreen';
import StatsScreen from '../../components/quiz/StatsScreen';
import { ThemeProvider } from '../../contexts/ThemeContext';

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

export default function QuizPage() {
  const { alphabet } = arabicAlphabet;
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
  };

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
    // Show stats screen temporarily, then auto-return to start
    setTimeout(() => {
      setQuizStats(null);
      setIsQuizStarted(false);
    }, 5000);
  };

  const handlePlayAgain = () => {
    setQuizStats(null);
    setIsQuizStarted(false);
  };

  const handleBackToMenu = () => {
    window.location.href = '/';
  };

  // Show stats screen if quiz was completed
  if (quizStats) {
    return (
      <ThemeProvider>
        <StatsScreen
          stats={quizStats}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {isQuizStarted ? (
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
      )}
    </ThemeProvider>
  );
}