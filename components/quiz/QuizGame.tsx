'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { addQuizSession } from '../../utils/statsStorage';

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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
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
      .slice(0, 3); // Changed from 2 to 3 for 4 total options
    
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
      setIsAudioPlaying(true);
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
      
      // Save stats to localStorage
      addQuizSession({
        totalQuestions: finalStats.totalQuestions,
        correctAnswers: finalStats.correctAnswers,
        wrongAnswers: finalStats.wrongAnswers,
        accuracy: finalStats.accuracy,
        timeSpent: finalStats.timeSpent,
      });
      
      onQuizComplete(finalStats);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 pb-24 md:pb-4 pt-2 md:pt-0 overflow-hidden">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={`/audio/letters/${currentQuestion.targetLetter.letter}.m4a`}
        preload="metadata"
        onEnded={() => setIsAudioPlaying(false)}
        onPause={() => setIsAudioPlaying(false)}
        onPlay={() => setIsAudioPlaying(true)}
      />

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-3 flex-shrink-0">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-[#58CC02] to-[#89E219] h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>Question {questionIndex + 1} of {totalQuestions}</span>
        </div>
      </div>

      {/* Question Area */}
      <div className="text-center mb-4 flex-shrink-0">
        {/* Visual Question Indicator */}
        <motion.div
          className="flex items-center justify-center mb-3"
          key={currentQuestion.targetLetter.letter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-2xl mr-2">👂</div>
          <div className="text-2xl mr-2">➡️</div>
          <div className="text-2xl">❓</div>
        </motion.div>

        {/* Audio Button with Lottie Animation */}
        <motion.button
          onClick={playAudio}
          className="bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          animate={{
            scale: isAudioPlaying ? 1 : [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: isAudioPlaying ? 0 : Infinity,
            repeatType: "reverse",
          }}
        >
          {/* Pulsing ring animation - only when not playing */}
          {!isAudioPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full border-3 border-[#58CC02]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Lottie Animation */}
          <div className="w-16 h-16 relative z-10">
            <DotLottieReact
              src="https://lottie.host/320523b6-1b03-4dad-b89f-c30ebcc5c5c3/0LKFmhO8HR.lottie"
              loop={isAudioPlaying}
              autoplay={isAudioPlaying}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </motion.button>
      </div>

      {/* Answer Choices - 2x2 Grid */}
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {currentQuestion.choices.map((choice, index) => (
              <motion.button
                key={`${choice.letter}-${currentQuestion.attempts}`}
                onClick={() => handleAnswer(choice)}
                disabled={showFeedback}
                className={`
                  relative aspect-square p-6 bg-white rounded-3xl shadow-lg
                  transition-all duration-200 overflow-hidden
                  flex items-center justify-center
                  ${showFeedback ? 'pointer-events-none' : 'hover:shadow-xl cursor-pointer'}
                  ${showFeedback && choice.letter === currentQuestion.targetLetter.letter
                    ? 'ring-4 ring-[#58CC02] bg-green-50'
                    : ''
                  }
                  ${showFeedback && isCorrect === false && choice.letter !== currentQuestion.targetLetter.letter
                    ? 'ring-4 ring-red-400 bg-red-50'
                    : ''
                  }
                `}
                style={{ 
                  borderColor: choice.color + '30',
                  border: `3px solid ${choice.color}30`
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Success/Error overlay */}
                {showFeedback && choice.letter === currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute inset-0 bg-[#58CC02] opacity-20 rounded-3xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Sparkle animation when playing */}
                {showFeedback && choice.letter === currentQuestion.targetLetter.letter && (
                  <>
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-yellow-400 rounded-full"
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: 2,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-1 h-1 bg-pink-400 rounded-full"
                      animate={{
                        scale: [0, 1.2, 0],
                        rotate: [0, -180, -360],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: 2,
                        ease: "easeInOut",
                        delay: 0.2
                      }}
                    />
                  </>
                )}

                <motion.div
                  className="text-7xl font-bold"
                  style={{
                    color: choice.color,
                    fontFamily: 'Noto Sans Arabic, sans-serif'
                  }}
                  animate={{
                    scale: showFeedback && choice.letter === currentQuestion.targetLetter.letter ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                >
                  {choice.letter}
                </motion.div>

                {/* Success icon overlay */}
                {showFeedback && choice.letter === currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute top-2 right-2 text-4xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    🎉
                  </motion.div>
                )}

                {/* Error shake animation */}
                {showFeedback && isCorrect === false && choice.letter !== currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      x: [-2, 2, -2, 2, 0],
                    }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Visual Feedback Messages */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`
                text-6xl font-bold px-8 py-6 rounded-3xl shadow-2xl
                ${isCorrect ? 'bg-green-100 border-4 border-green-300' : 'bg-red-100 border-4 border-red-300'}
              `}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: "spring", damping: 15 }}
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
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 5],
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