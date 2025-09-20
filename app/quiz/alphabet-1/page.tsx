'use client';

import { useState } from 'react';
import AlphabetQuiz from '../../../components/quiz/AlphabetQuiz';
import StatsScreen from '../../../components/quiz/StatsScreen';
import { ThemeProvider } from '../../../contexts/ThemeContext';

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

export default function AlphabetQuiz1Page() {
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
    // Results stay visible until user chooses an action
  };

  const handlePlayAgain = () => {
    setQuizStats(null);
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
      <AlphabetQuiz
        quizId="alphabet-1"
        onQuizComplete={handleQuizComplete}
      />
    </ThemeProvider>
  );
}