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
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const animations = [
    "https://lottie.host/2e6b9316-da00-4784-86ad-4264a83058ca/z4P7vBcOZW.lottie",
    "https://lottie.host/5f1da134-5a5b-4879-9022-5a06a01e3990/zOK36Of9iM.lottie",
    "https://lottie.host/40c9f475-d6ef-408e-9750-c5f790eeedcf/h7GveJPGuo.lottie"
  ];

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
      // Cycle to next animation
      setCurrentAnimationIndex(prev => (prev + 1) % animations.length);
    } else if (wrongAnswers.length > 0) {
      // Retry wrong answers
      const wrongLetter = wrongAnswers[0];
      setWrongAnswers(prev => prev.slice(1));
      setCurrentQuestion(generateQuestion(wrongLetter));
      // Cycle to next animation
      setCurrentAnimationIndex(prev => (prev + 1) % animations.length);
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
    <div className="h-screen flex flex-col bg-slate-800 p-3 pb-24 md:pb-4 pt-2 md:pt-0 overflow-hidden">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={`/audio/letters/${currentQuestion.targetLetter.letter}.m4a`}
        preload="metadata"
        onEnded={() => setIsAudioPlaying(false)}
        onPause={() => setIsAudioPlaying(false)}
        onPlay={() => setIsAudioPlaying(true)}
      />

      {/* Floating Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-700/90 backdrop-blur-sm">
        <div className="bg-gray-600 h-3 w-full">
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
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="text-left mb-8">
        <h1 className="text-white text-3xl font-bold">Tap what you hear</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center px-4">
        <div className="w-full flex items-center justify-between">
          {/* Left side - Character Animation */}
          <div className="w-1/2 flex justify-center">
            <div className="w-32 h-32">
              <DotLottieReact
                key={currentAnimationIndex} // Force re-render when animation changes
                src={animations[currentAnimationIndex]}
                loop
                autoplay
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          </div>

          {/* Right side - Audio Button */}
          <div className="w-1/2 flex justify-center">
            <motion.button
              onClick={playAudio}
              className="bg-slate-700 border-2 border-slate-600 rounded-xl p-8 flex items-center justify-center hover:bg-slate-600 transition-colors w-32 h-20"
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
          <AnimatePresence mode="wait">
            {currentQuestion.choices.map((choice, index) => (
              <motion.button
                key={choice.letter}
                onClick={() => handleAnswer(choice)}
                disabled={showFeedback}
                className={`
                  relative aspect-square p-4 bg-slate-700 border-2 border-slate-600 rounded-xl
                  overflow-hidden flex items-center justify-center
                  ${showFeedback ? 'pointer-events-none' : 'hover:bg-slate-600 cursor-pointer'}
                  ${showFeedback && choice.letter === currentQuestion.targetLetter.letter
                    ? 'ring-2 ring-[#58CC02] bg-green-800'
                    : ''
                  }
                  ${showFeedback && isCorrect === false && choice.letter !== currentQuestion.targetLetter.letter
                    ? 'ring-2 ring-red-400 bg-red-800'
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
                    className="absolute inset-0 bg-[#58CC02] opacity-20 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Letter */}
                <motion.div
                  className="text-6xl font-bold pointer-events-none select-none text-white"
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
          </AnimatePresence>
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