'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Letter {
  letter: string;
  name: string;
  englishName: string;
  sound: string;
  color: string;
  category: string;
}

interface QuizGameProps {
  letters: Letter[];
  onQuizComplete: (stats: QuizStats) => void;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

interface Question {
  targetLetter: Letter;
  choices: Letter[];
  attempts: number;
}

export default function QuizGame({ letters, onQuizComplete }: QuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [stats, setStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracy: 0,
    timeSpent: 0
  });
  const [wrongAnswers, setWrongAnswers] = useState<Letter[]>([]);
  const [startTime] = useState(Date.now());
  const audioRef = useRef<HTMLAudioElement>(null);

  const totalQuestions = 10; // Quiz length

  // Generate a random question
  const generateQuestion = (targetLetter?: Letter): Question => {
    const target = targetLetter || letters[Math.floor(Math.random() * letters.length)];
    const otherLetters = letters.filter(l => l.letter !== target.letter);
    const randomChoices = otherLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    const choices = [target, ...randomChoices].sort(() => Math.random() - 0.5);
    
    return {
      targetLetter: target,
      choices,
      attempts: 0
    };
  };

  // Initialize first question
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, [letters]);

  // Play audio for current letter
  const playAudio = () => {
    if (currentQuestion && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      
      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(40);
      }
    }
  };

  // Auto-play audio when question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimeout(playAudio, 500);
    }
  }, [currentQuestion]);

  const handleAnswer = (selectedLetter: Letter) => {
    if (!currentQuestion) return;

    const correct = selectedLetter.letter === currentQuestion.targetLetter.letter;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update question attempts
    const updatedQuestion = {
      ...currentQuestion,
      attempts: currentQuestion.attempts + 1
    };
    setCurrentQuestion(updatedQuestion);

    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(correct ? [50, 50, 50] : [100]);
    }

    if (correct) {
      // Update stats
      setStats(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + 1,
        accuracy: ((prev.correctAnswers + 1) / (prev.totalQuestions + 1)) * 100
      }));

      // Move to next question after delay
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      // Add to wrong answers for retry later
      if (!wrongAnswers.find(l => l.letter === currentQuestion.targetLetter.letter)) {
        setWrongAnswers(prev => [...prev, currentQuestion.targetLetter]);
      }

      setStats(prev => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1
      }));

      // Show error and allow retry
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
      }, 2000);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setIsCorrect(null);

    if (questionIndex < totalQuestions - 1) {
      // Regular progression
      setQuestionIndex(prev => prev + 1);
      setProgress(((questionIndex + 1) / totalQuestions) * 100);
      setCurrentQuestion(generateQuestion());
    } else if (wrongAnswers.length > 0) {
      // Retry wrong answers
      const wrongLetter = wrongAnswers[0];
      setWrongAnswers(prev => prev.slice(1));
      setCurrentQuestion(generateQuestion(wrongLetter));
    } else {
      // Quiz complete
      const finalStats = {
        ...stats,
        timeSpent: Math.round((Date.now() - startTime) / 1000)
      };
      onQuizComplete(finalStats);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pb-20 md:pb-4">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={`/audio/letters/${currentQuestion.targetLetter.letter}.m4a`}
        preload="metadata"
      />

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Question {questionIndex + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-4"
          key={currentQuestion.targetLetter.letter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Which letter makes this sound?
        </motion.h2>

        {/* Audio Button */}
        <motion.button
          onClick={playAudio}
          className="bg-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-200 mb-8"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="text-4xl">🔊</div>
          <div className="text-sm text-gray-600 mt-2 font-medium">Tap to hear</div>
        </motion.button>
      </div>

      {/* Answer Choices */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {currentQuestion.choices.map((choice, index) => (
              <motion.button
                key={`${choice.letter}-${currentQuestion.attempts}`}
                onClick={() => handleAnswer(choice)}
                disabled={showFeedback}
                className={`
                  relative p-8 bg-white rounded-3xl shadow-lg
                  transition-all duration-200 overflow-hidden
                  ${showFeedback ? 'pointer-events-none' : 'hover:shadow-xl cursor-pointer'}
                  ${showFeedback && choice.letter === currentQuestion.targetLetter.letter
                    ? 'ring-4 ring-green-400 bg-green-50'
                    : ''
                  }
                  ${showFeedback && isCorrect === false && choice.letter !== currentQuestion.targetLetter.letter
                    ? 'ring-4 ring-red-400 bg-red-50'
                    : ''
                  }
                `}
                style={{ borderColor: choice.color + '30' }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Success/Error overlay */}
                {showFeedback && choice.letter === currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute inset-0 bg-green-400 opacity-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <div
                  className="text-6xl font-bold mb-4"
                  style={{
                    color: choice.color,
                    fontFamily: 'Noto Sans Arabic, sans-serif'
                  }}
                >
                  {choice.letter}
                </div>
                <div className="text-lg text-gray-600 font-medium">
                  {choice.englishName}
                </div>

                {/* Feedback icons */}
                {showFeedback && choice.letter === currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute top-4 right-4 text-3xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    ✅
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`
                text-4xl font-bold px-8 py-4 rounded-2xl
                ${isCorrect ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}
              `}
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -50 }}
            >
              {isCorrect ? '🎉 Correct!' : '❌ Try again!'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}