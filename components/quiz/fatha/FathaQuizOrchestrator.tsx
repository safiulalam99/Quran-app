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
  const playAudio = () => {
    if (audioRef.current && !showFeedback) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);

      if ('vibrate' in navigator) {
        navigator.vibrate(40);
      }
    }
  };

  // Handle answer
  const handleAnswer = async (selectedLetter: FathaLetter) => {
    if (!currentQuestion || showFeedback) return;

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

      if (currentQuestionIndex + 1 >= totalQuestions) {
        completeQuiz(updatedProgress);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        const nextQuestion = generateQuestion();
        setCurrentQuestion(nextQuestion);

        // Auto-play next question audio
        setTimeout(() => {
          if (nextQuestion && audioRef.current) {
            audioRef.current.play().catch(console.error);
          }
        }, 500);
      }
    }, 1500);
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
    <div className={`h-screen flex flex-col p-3 pb-24 md:pb-8 pt-12 md:pt-24 overflow-hidden ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      {/* Audio elements */}
      <audio
        ref={audioRef}
        src={`/audio/Fatha/${currentQuestion.targetLetter.letter}.m4a`}
        preload="metadata"
      />
      <audio ref={correctAudioRef} src="/audio/correct.mp3" preload="metadata" />
      <audio ref={wrongAudioRef} src="/audio/wrong.mp3" preload="metadata" />

      {/* Progress Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm ${
        theme === 'dark' ? 'bg-slate-700/90' : 'bg-white/90'
      }`}>
        <div className={`h-3 w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-12 flex-shrink-0"></div>

      {/* Close button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={onExit}
          className={`transition-colors ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="text-left mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {currentQuestion.type === QuestionType.TAP_WHAT_YOU_HEAR
            ? 'Tap what you hear'
            : 'Which sound does this make?'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center px-4">
        <div className="w-full flex items-center justify-between">
          {/* Left side */}
          <div className="w-1/2 flex justify-center">
            <div className="w-36 h-36 flex items-center justify-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-700 border-2 border-slate-600' : 'bg-white border-2 border-gray-200 shadow-md'
              }`}>
                {currentQuestion.type === QuestionType.TAP_WHAT_YOU_HEAR ? (
                  <span className="text-6xl">👂</span>
                ) : (
                  <span className="text-6xl" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                    {currentQuestion.targetLetter.letterWithFatha}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Audio Button (only for audio questions) */}
          {currentQuestion.type === QuestionType.TAP_WHAT_YOU_HEAR && (
            <div className="w-1/2 flex justify-center">
              <motion.button
                onClick={playAudio}
                className={`border-2 rounded-xl p-8 flex items-center justify-center transition-colors w-32 h-20 ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-gray-300 hover:bg-gray-50 shadow-md'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#10b981">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Answer Choices */}
      <div className="pb-8">
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto px-4">
          {currentQuestion.choices.map((choice, index) => {
            const isTarget = choice.letter === currentQuestion.targetLetter.letter;
            const showCorrect = showFeedback && isTarget;
            const showWrong = showFeedback && !isCorrect && !isTarget;

            return (
              <motion.button
                key={`${currentQuestion.targetLetter.letter}-${choice.letter}`}
                onClick={() => handleAnswer(choice)}
                disabled={showFeedback}
                className={`
                  relative aspect-square p-4 border-2 rounded-xl
                  overflow-hidden flex flex-col items-center justify-center transition-all duration-200
                  ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300 shadow-md'}
                  ${showFeedback ? 'pointer-events-none' : theme === 'dark' ? 'hover:bg-slate-600 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'}
                  ${showCorrect ? (theme === 'dark' ? 'ring-4 ring-emerald-500 bg-green-800' : 'ring-4 ring-emerald-500 bg-green-100') : ''}
                  ${showWrong ? (theme === 'dark' ? 'ring-4 ring-red-400 bg-red-800' : 'ring-4 ring-red-400 bg-red-100') : ''}
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: showFeedback ? 1 : 1.05 }}
              >
                {showCorrect && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0.2] }}
                    transition={{ duration: 0.6 }}
                  />
                )}

                <motion.div
                  className={`text-5xl font-bold pointer-events-none select-none ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                  style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
                  animate={{ scale: showCorrect ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentQuestion.type === QuestionType.TAP_WHAT_YOU_HEAR
                    ? choice.letterWithFatha
                    : ''}
                </motion.div>

                <div className={`text-sm font-medium mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentQuestion.type === QuestionType.TAP_WHAT_YOU_HEAR
                    ? choice.sound
                    : choice.sound}
                </div>

                {showCorrect && (
                  <motion.div
                    className="absolute top-1 right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "backOut" }}
                  >
                    <span className="text-lg">✅</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Visual Feedback Messages */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`
                text-8xl px-6 py-4 rounded-2xl
                ${isCorrect ? 'bg-green-100/90' : 'bg-red-100/90'}
              `}
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -20 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.3
              }}
            >
              {isCorrect ? '🎉' : '🤔'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration particles for correct answers */}
      {isCorrect && showFeedback && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#8b5cf6'][i % 5],
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [-20, -60, -20],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 360, 720],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
