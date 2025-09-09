'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addQuizSession } from '../../utils/statsStorage';
import { useTheme } from '../../contexts/ThemeContext';

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
  onBackToMenu?: () => void;
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

export default function QuizGame({ letters, onQuizComplete, onBackToMenu }: QuizGameProps) {
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
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const wrongAudioRef = useRef<HTMLAudioElement>(null);
  const { theme } = useTheme();

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

  // Enhanced haptic feedback function
  const playHapticFeedback = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Play feedback audio and haptics
  const playFeedbackAudio = (isCorrect: boolean) => {
    const audioElement = isCorrect ? correctAudioRef.current : wrongAudioRef.current;
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(console.error);
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

    // Play feedback audio and enhanced haptics
    playFeedbackAudio(correct);
    
    if (correct) {
      // Success haptics: Triple pulse
      playHapticFeedback([80, 50, 80, 50, 80]);
    } else {
      // Error haptics: Long strong pulse
      playHapticFeedback([200]);
    }

    if (correct) {
      // Update stats
      setStats(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + 1,
        accuracy: ((prev.correctAnswers + 1) / (prev.totalQuestions + 1)) * 100
      }));

      // Play the audio again for confirmation
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      }, 800); // Play audio after celebration

      // Wait longer to let audio finish and celebrate
      setTimeout(() => {
        nextQuestion();
      }, 2500); // Increased from 1500ms to 2500ms
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
    <div className={`h-screen flex flex-col p-3 pb-24 md:pb-4 pt-2 md:pt-0 overflow-hidden ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Audio elements */}
      <audio
        ref={audioRef}
        src={`/audio/letters/${currentQuestion.targetLetter.letter}.m4a`}
        preload="metadata"
        onEnded={() => setIsAudioPlaying(false)}
        onPause={() => setIsAudioPlaying(false)}
        onPlay={() => setIsAudioPlaying(true)}
      />
      
      {/* Feedback audio elements */}
      <audio
        ref={correctAudioRef}
        src="/audio/correct.mp3"
        preload="metadata"
      />
      
      <audio
        ref={wrongAudioRef}
        src="/audio/wrong.mp3"
        preload="metadata"
      />

      {/* Floating Progress Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm ${
        theme === 'dark' ? 'bg-slate-700/90' : 'bg-white/90'
      }`}>
        <div className={`h-3 w-full ${
          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
        }`}>
          <motion.div
            className="bg-gradient-to-r from-[#58CC02] to-[#89E219] h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      {/* Spacer for floating progress bar */}
      <div className="h-12 flex-shrink-0"></div>

      {/* Close button */}
      <div className="flex justify-start mb-4">
        <button 
          onClick={onBackToMenu}
          className={`transition-colors ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-white' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="text-left mb-8">
        <h1 className={`text-3xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Tap what you hear</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center px-4">
        <div className="w-full flex items-center justify-between">
          {/* Left side - Simple Visual */}
          <div className="w-1/2 flex justify-center">
            <div className="w-36 h-36 flex items-center justify-center">
              {/* Simple static visual - no animations to prevent infinite loops */}
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-2 border-slate-600' 
                  : 'bg-white border-2 border-gray-200 shadow-md'
              }`}>
                <span className="text-6xl">👂</span>
              </div>
            </div>
          </div>

          {/* Right side - Audio Button */}
          <div className="w-1/2 flex justify-center">
            <motion.button
              onClick={playAudio}
              className={`border-2 rounded-xl p-8 flex items-center justify-center transition-colors w-32 h-20 ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' 
                  : 'bg-white border-gray-300 hover:bg-gray-50 shadow-md'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#58CC02">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Answer Choices at Bottom */}
      <div className="pb-8">
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto px-4">
          {currentQuestion.choices.map((choice, index) => (
            <motion.button
              key={`${currentQuestion.targetLetter.letter}-${choice.letter}`}
              onClick={() => handleAnswer(choice)}
              disabled={showFeedback}
                className={`
                  relative aspect-square p-4 border-2 rounded-xl
                  overflow-hidden flex items-center justify-center transition-all duration-200
                  ${theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600' 
                    : 'bg-white border-gray-300 shadow-md'
                  }
                  ${showFeedback ? 'pointer-events-none' : theme === 'dark' 
                    ? 'hover:bg-slate-600 cursor-pointer' 
                    : 'hover:bg-gray-50 cursor-pointer'
                  }
                  ${showFeedback && choice.letter === currentQuestion.targetLetter.letter
                    ? theme === 'dark'
                      ? 'ring-4 ring-[#58CC02] bg-green-800 shadow-lg shadow-green-500/50'
                      : 'ring-4 ring-[#58CC02] bg-green-100 shadow-lg shadow-green-500/30'
                    : ''
                  }
                  ${showFeedback && isCorrect === false && choice.letter !== currentQuestion.targetLetter.letter
                    ? theme === 'dark'
                      ? 'ring-4 ring-red-400 bg-red-800 shadow-lg shadow-red-500/50'
                      : 'ring-4 ring-red-400 bg-red-100 shadow-lg shadow-red-500/30'
                    : ''
                  }
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    duration: 0.3, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }
                }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: showFeedback ? 1 : 1.05 }}
                layout
              >
                {/* Success/Error overlay */}
                {showFeedback && choice.letter === currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute inset-0 bg-[#58CC02] rounded-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.3, 0.2], 
                      scale: [0.8, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 0.6,
                      times: [0, 0.3, 1],
                      ease: "easeOut"
                    }}
                  />
                )}
                
                {showFeedback && isCorrect === false && choice.letter !== currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute inset-0 bg-red-500 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.25, 0.15],
                      scale: [1, 0.95, 1]
                    }}
                    transition={{ 
                      duration: 0.4,
                      times: [0, 0.5, 1],
                      ease: "easeOut"
                    }}
                  />
                )}

                {/* Letter */}
                <motion.div
                  className={`text-6xl font-bold pointer-events-none select-none ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                  style={{
                    fontFamily: 'Noto Sans Arabic, sans-serif'
                  }}
                  animate={{
                    scale: showFeedback && choice.letter === currentQuestion.targetLetter.letter ? 1.1 : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                >
                  {choice.letter}
                </motion.div>

                {/* Success icon overlay */}
                {showFeedback && choice.letter === currentQuestion.targetLetter.letter && (
                  <motion.div
                    className="absolute top-1 right-1 w-8 h-8 bg-[#58CC02] rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "backOut" }}
                  >
                    <span className="text-lg">✅</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
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