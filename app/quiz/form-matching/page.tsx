'use client';

import { useState } from 'react';
import FormsQuiz from '../../../components/quiz/FormsQuiz';
import StatsScreen from '../../../components/quiz/StatsScreen';
import { ThemeProvider } from '../../../contexts/ThemeContext';

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

export default function FormMatchingPage() {
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
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
      <FormsQuiz
        quizId="form-matching"
        onQuizComplete={handleQuizComplete}
      />
    </ThemeProvider>
  );
}

