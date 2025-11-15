'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import fathaData from '../../data/arabic-fatha.json';
import FathaQuizOrchestrator from '../../../components/quiz/fatha/FathaQuizOrchestrator';
import FathaQuizSummary from '../../../components/quiz/fatha/FathaQuizSummary';
import type { QuizSessionStats } from '../../../types/quiz.types';

type QuizState = 'playing' | 'summary';

export default function FathaQuizPage() {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>('playing');
  const [sessionStats, setSessionStats] = useState<QuizSessionStats | null>(null);

  const { fathaLetters } = fathaData;

  const handleComplete = (stats: QuizSessionStats) => {
    setSessionStats(stats);
    setQuizState('summary');
  };

  const handlePlayAgain = () => {
    setSessionStats(null);
    setQuizState('playing');
  };

  const handleBackToMenu = () => {
    router.push('/fatha');
  };

  const handleExit = () => {
    router.push('/fatha');
  };

  return (
    <>
      {quizState === 'playing' && (
        <FathaQuizOrchestrator
          letters={fathaLetters as any}
          totalQuestions={10}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {quizState === 'summary' && sessionStats && (
        <FathaQuizSummary
          stats={sessionStats}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </>
  );
}
