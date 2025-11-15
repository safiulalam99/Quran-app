'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

// Types
import { QuestionType } from '../../../types/quiz.types';
import type {
  FathaLetter,
  MemoryState,
  UserProgress,
  QuizSessionStats,
  AnswerResult,
} from '../../../types/quiz.types';

// Utilities
import {
  selectNextItem,
  updateMemoryStateCorrect,
  updateMemoryStateIncorrect,
  createMemoryState,
} from '../../../utils/quiz/spacedRepetition';
import {
  calculateXPForAnswer,
  addXP,
  updateStreak,
} from '../../../utils/quiz/gamification';
import {
  loadUserProgress,
  saveUserProgress,
  setMemoryState,
  getMemoryState,
  getAllMemoryStates,
  addSessionToHistory,
} from '../../../utils/quiz/storage';

interface FathaQuizOrchestratorProps {
  readonly letters: readonly FathaLetter[];
  readonly totalQuestions?: number;
  readonly onComplete: (stats: QuizSessionStats) => void;
  readonly onExit?: () => void;
}

interface Question {
  type: QuestionType;
  targetLetter: FathaLetter;
  choices: FathaLetter[];
}

export default function FathaQuizOrchestrator({
  letters,
  totalQuestions = 10,
  onComplete,
  onExit,
}: FathaQuizOrchestratorProps) {
  const { theme } = useTheme();

  // Progress state
  const [userProgress, setUserProgress] = useState<UserProgress>(() => loadUserProgress());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState(0);

  // Session state
  const [sessionStats, setSessionStats] = useState({
    correctAnswers: 0,
    wrongAnswers: 0,
    totalXPEarned: 0,
    startTime: Date.now(),
  });

  // UI state
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<FathaLetter | null>(null);

  // Audio refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const wrongAudioRef = useRef<HTMLAudioElement>(null);

  // Initialize memory states
  useEffect(() => {
    let updated = userProgress;
    let hasChanges = false;

    letters.forEach((letter) => {
      const existing = getMemoryState(updated, letter.letter);
      if (!existing) {
        const newState = createMemoryState(letter.letter);
        updated = setMemoryState(updated, newState);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setUserProgress(updated);
      saveUserProgress(updated);
    }
  }, [letters]);

  // Generate question
  const generateQuestion = useCallback((): Question | null => {
    const memoryStates = getAllMemoryStates<string>(userProgress);
    const letterStates = memoryStates.filter((state) =>
      letters.some((l) => l.letter === state.itemId)
    );

    if (letterStates.length === 0) return null;

    const selectedState = selectNextItem(letterStates, currentQuestionIndex, []);
    if (!selectedState) return null;

    const targetLetter = letters.find((l) => l.letter === selectedState.itemId);
    if (!targetLetter) return null;

    const questionType = currentQuestionIndex % 2 === 0
      ? QuestionType.TAP_WHAT_YOU_HEAR
      : QuestionType.WHICH_SOUND;

    const otherLetters = letters.filter((l) => l.letter !== targetLetter.letter);
    const randomOthers = otherLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [targetLetter, ...randomOthers].sort(() => Math.random() - 0.5);

    return { type: questionType, targetLetter, choices };
  }, [letters, userProgress, currentQuestionIndex]);

  // Load first question
  useEffect(() => {
    if (!currentQuestion && currentQuestionIndex === 0) {
      const question = generateQuestion();
      setCurrentQuestion(question);

      // Auto-play audio after a delay to ensure UI is ready
      setTimeout(() => {
        if (question && audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }, 800);
    }
  }, [currentQuestion, currentQuestionIndex, generateQuestion]);

  // Update progress bar
  useEffect(() => {
    setProgress((currentQuestionIndex / totalQuestions) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  // Play audio
  const playAudio = async () => {
    if (audioRef.current) {
      try {
        setIsAudioPlaying(true);
        audioRef.current.currentTime = 0;
        await audioRef.current.play();

        if ('vibrate' in navigator) {
          navigator.vibrate(40);
        }
      } catch (error) {
        console.log('Audio play failed:', error);
        setIsAudioPlaying(false);
      }
    }
  };

  // Handle answer
  const handleAnswer = async (selectedLetter: FathaLetter) => {
    if (!currentQuestion || showFeedback) return;

    setSelectedAnswer(selectedLetter);
    const correct = selectedLetter.letter === currentQuestion.targetLetter.letter;
    const responseTime = Date.now() - sessionStats.startTime;

    setIsCorrect(correct);
    setShowFeedback(true);

    // Play feedback audio
    const feedbackAudio = correct ? correctAudioRef.current : wrongAudioRef.current;
    if (feedbackAudio) {
      feedbackAudio.currentTime = 0;
      feedbackAudio.play().catch(console.error);
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(correct ? [80, 50, 80] : [200]);
    }

    // Update memory state
    const memoryState = getMemoryState<string>(userProgress, currentQuestion.targetLetter.letter);
    if (!memoryState) return;

    const updatedMemoryState = correct
      ? updateMemoryStateCorrect(memoryState, responseTime, currentQuestionIndex)
      : updateMemoryStateIncorrect(memoryState, responseTime, currentQuestionIndex);

    let updatedProgress = setMemoryState(userProgress, updatedMemoryState);
    updatedProgress = {
      ...updatedProgress,
      streak: updateStreak(updatedProgress.streak, correct),
    };

    if (correct) {
      const isFirstTimeCorrect = memoryState.correctCount === 0;
      const answerResult: AnswerResult = {
        isCorrect: correct,
        responseTime,
        attempts: 1,
        xpEarned: 0,
        feedbackMessage: '',
      };

      const xpEarned = calculateXPForAnswer(
        answerResult,
        updatedProgress.streak.currentStreak,
        isFirstTimeCorrect
      );

      const { system: newXPSystem } = addXP(updatedProgress.xp, xpEarned);
      updatedProgress = { ...updatedProgress, xp: newXPSystem };

      setSessionStats((prev) => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        totalXPEarned: prev.totalXPEarned + xpEarned,
      }));

    } else {
      setSessionStats((prev) => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
      }));
    }

    setUserProgress(updatedProgress);
    saveUserProgress(updatedProgress);

    // Move to next question
    setTimeout(() => {
      setShowFeedback(false);
      setIsCorrect(null);
      setSelectedAnswer(null);

      if (currentQuestionIndex + 1 >= totalQuestions) {
        completeQuiz(updatedProgress);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        const nextQuestion = generateQuestion();
        setCurrentQuestion(nextQuestion);

        // Auto-play next question audio
        setTimeout(() => {
          if (nextQuestion) {
            playAudio();
          }
        }, 400);
      }
    }, 2000);
  };

  // Complete quiz
  const completeQuiz = (finalProgress: UserProgress) => {
    const timeSpent = Math.floor((Date.now() - sessionStats.startTime) / 1000);
    const accuracy = Math.round((sessionStats.correctAnswers / totalQuestions) * 100);

    const stats: QuizSessionStats = {
      totalQuestions,
      correctAnswers: sessionStats.correctAnswers,
      wrongAnswers: sessionStats.wrongAnswers,
      accuracy,
      averageResponseTime: timeSpent / totalQuestions,
      timeSpent,
      xpEarned: sessionStats.totalXPEarned,
      perfectRound: sessionStats.wrongAnswers === 0,
      newAchievements: [],
    };

    const updatedProgress = addSessionToHistory(finalProgress, {
      id: Date.now().toString(),
      quizId: 'fatha-quiz',
      date: new Date().toISOString(),
      stats,
      itemsPracticed: letters.map((l) => l.letter),
    });

    saveUserProgress(updatedProgress);
    onComplete(stats);
  };

  if (!currentQuestion) return null;

  return (
    <>
      <div className={`min-h-screen flex flex-col p-3 md:p-4 pb-24 md:pb-8 pt-0 md:pt-24 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
      }`}>

        {/* Audio elements */}
        <audio
          ref={audioRef}
          src={`/audio/Fatha/${currentQuestion.targetLetter.letter}.m4a`}
          preload="metadata"
          onEnded={() => setIsAudioPlaying(false)}
          onPause={() => setIsAudioPlaying(false)}
          onPlay={() => setIsAudioPlaying(true)}
        />
        <audio ref={correctAudioRef} src="/audio/correct.mp3" preload="metadata" />
        <audio ref={wrongAudioRef} src="/audio/wrong.mp3" preload="metadata" />

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className={`text-2xl md:text-3xl font-bold mb-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Fatha Quiz
          </h1>
          <div className={`text-sm md:text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>

          {/* Progress bar */}
          <div className={`w-full max-w-md mx-auto mt-3 h-2 md:h-2 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Display */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto py-2 md:py-0">

          {/* Audio Question - Show speaker icon */}
          {currentQuestion.type === QuestionType.TAP_WHAT_YOU_HEAR && (
            <div className="mb-4 md:mb-12">
              <motion.div
                className={`w-56 h-56 md:w-80 md:h-80 rounded-3xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-white border border-gray-200'
                } ${isAudioPlaying ? 'ring-4 ring-emerald-500 ring-opacity-60' : ''}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  ...(isAudioPlaying && {
                    scale: [1, 1.05, 1],
                  })
                }}
                transition={{
                  duration: isAudioPlaying ? 0.8 : 0.6,
                  repeat: isAudioPlaying ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {/* Pulsing background when playing */}
                {isAudioPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-emerald-500"
                    animate={{
                      opacity: [0, 0.2, 0],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Large Audio Icon */}
                <motion.button
                  onClick={playAudio}
                  className="relative z-10 mb-4"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    scale: isAudioPlaying ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: isAudioPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill={theme === 'dark' ? '#34d399' : '#10b981'}
                    className="drop-shadow-lg"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </motion.button>

                {/* Sound waves animation when playing */}
                {isAudioPlaying && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <motion.div
                      className={`w-1 h-8 rounded-full ${
                        theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                      }`}
                      animate={{
                        scaleY: [0.5, 1.5, 0.5],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className={`w-1 h-6 rounded-full ${
                        theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                      }`}
                      animate={{
                        scaleY: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2
                      }}
                    />
                    <motion.div
                      className={`w-1 h-4 rounded-full ${
                        theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                      }`}
                      animate={{
                        scaleY: [0.7, 1.3, 0.7],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4
                      }}
                    />
                  </div>
                )}

                <div className={`text-center relative z-10 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="text-base md:text-lg font-medium mb-1">Listen and choose</div>
                  <div className="text-sm md:text-sm opacity-75">Tap to replay sound</div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Answer Options */}
          <motion.div
            className="grid grid-cols-2 gap-4 w-full max-w-md md:max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {currentQuestion.choices.map((option, index) => (
              <motion.button
                key={option.letter}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
                className={`relative aspect-square rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-200 ${
                  showFeedback && selectedAnswer?.letter === option.letter
                    ? isCorrect
                      ? 'bg-green-500 text-white ring-4 ring-green-300'
                      : 'bg-red-500 text-white ring-4 ring-red-300'
                    : showFeedback && option.letter === currentQuestion.targetLetter.letter
                      ? 'bg-green-500 text-white ring-4 ring-green-300'
                      : theme === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-800'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  borderColor: !showFeedback ? option.baseColor + '20' : undefined
                }}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                whileHover={!showFeedback ? { scale: 1.02 } : {}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              >
                {/* Letter */}
                <span
                  className="text-2xl md:text-3xl font-bold mb-2"
                  style={{
                    fontFamily: 'Noto Sans Arabic, sans-serif',
                    color: showFeedback ? 'inherit' : option.baseColor
                  }}
                >
                  {option.letterWithFatha}
                </span>

                {/* Sound */}
                <span className="text-sm md:text-sm font-medium text-center">
                  {option.sound}
                </span>

                {/* Feedback Icons */}
                {showFeedback && selectedAnswer?.letter === option.letter && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: isCorrect ? '#22c55e' : '#ef4444' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </motion.div>
                )}

                {showFeedback && selectedAnswer?.letter !== option.letter && option.letter === currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
