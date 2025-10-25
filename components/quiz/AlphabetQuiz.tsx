'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import arabicAlphabet from '../../app/data/arabic-alphabet.json';

interface Letter {
  letter: string;
  name: string;
  englishName: string;
  sound: string;
  color: string;
  category: string;
}

interface QuizQuestion {
  correctLetter: Letter;
  options: Letter[];
  questionType: 'audio';
}

interface AlphabetQuizProps {
  quizId: 'alphabet-1' | 'alphabet-2' | 'alphabet-3';
  onQuizComplete: (stats: QuizStats) => void;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

// Quiz configurations for 3 alphabet quizzes
const quizConfigs = {
  'alphabet-1': {
    title: 'Alphabet Quiz 1',
    description: 'Letters 1-9',
    startIndex: 0,
    endIndex: 9,
    totalQuestions: 9
  },
  'alphabet-2': {
    title: 'Alphabet Quiz 2', 
    description: 'Letters 10-18',
    startIndex: 9,
    endIndex: 18,
    totalQuestions: 9
  },
  'alphabet-3': {
    title: 'Alphabet Quiz 3',
    description: 'Letters 19-28',
    startIndex: 18,
    endIndex: 28,
    totalQuestions: 10
  }
};

export default function AlphabetQuiz({ quizId, onQuizComplete }: AlphabetQuizProps) {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const wrongAudioRef = useRef<HTMLAudioElement>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<Letter | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [stats, setStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracy: 0,
    timeSpent: 0
  });
  const [startTime] = useState(Date.now());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const config = quizConfigs[quizId];
  const alphabet = arabicAlphabet.alphabet as Letter[];
  const quizLetters = alphabet.slice(config.startIndex, config.endIndex);

  // Generate quiz questions
  useEffect(() => {
    const generateQuestions = () => {
      const newQuestions: QuizQuestion[] = quizLetters.map(letter => {
        // Get 3 random wrong answers from the same quiz set
        const wrongAnswers = quizLetters
          .filter(l => l.letter !== letter.letter)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        // Combine correct and wrong answers, then shuffle
        const options = [letter, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        return {
          correctLetter: letter,
          options,
          questionType: 'audio' // Always use audio questions
        };
      });
      
      // Shuffle questions
      setQuestions(newQuestions.sort(() => Math.random() - 0.5));
      setStats(prev => ({ ...prev, totalQuestions: newQuestions.length }));
    };

    generateQuestions();
  }, [quizId]);

  const currentQuestion = questions[currentQuestionIndex];

  const playAudio = async (letter: string) => {
    if (audioRef.current) {
      audioRef.current.src = `/audio/letters/${letter}.m4a`;
      try {
        setIsAudioPlaying(true);
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.log('Audio play failed:', error);
        setIsAudioPlaying(false);
      }
    }
  };

  // Play feedback audio
  const playFeedbackAudio = (isCorrect: boolean) => {
    const audioElement = isCorrect ? correctAudioRef.current : wrongAudioRef.current;
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(console.error);
    }
  };

  // Auto-play audio for audio questions when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.questionType === 'audio') {
      // Delay slightly to allow UI to render
      setTimeout(() => {
        playAudio(currentQuestion.correctLetter.letter);
      }, 300);
    }
  }, [currentQuestionIndex, questions]); // Depend on index and questions array

  const handleAnswerSelect = (selectedLetter: Letter) => {
    if (showFeedback) return;

    setSelectedAnswer(selectedLetter);
    const correct = selectedLetter.letter === currentQuestion.correctLetter.letter;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Play feedback audio
    playFeedbackAudio(correct);

    // Update stats
    setStats(prev => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      wrongAnswers: correct ? prev.wrongAnswers : prev.wrongAnswers + 1
    }));

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowFeedback(false);

        // Ensure audio plays for the next question
        setTimeout(() => {
          const nextQuestion = questions[currentQuestionIndex + 1];
          if (nextQuestion) {
            playAudio(nextQuestion.correctLetter.letter);
          }
        }, 400); // Small delay after state updates
      } else {
        // Quiz complete
        const finalStats = {
          ...stats,
          correctAnswers: correct ? stats.correctAnswers + 1 : stats.correctAnswers,
          wrongAnswers: correct ? stats.wrongAnswers : stats.wrongAnswers + 1,
          timeSpent: Math.round((Date.now() - startTime) / 1000),
          accuracy: Math.round(((correct ? stats.correctAnswers + 1 : stats.correctAnswers) / questions.length) * 100)
        };
        onQuizComplete(finalStats);
      }
    }, 2000);
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className={`min-h-screen flex flex-col p-3 md:p-4 pb-24 md:pb-8 pt-0 md:pt-24 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        
        {/* Audio element */}
        <audio
          ref={audioRef}
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

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className={`text-2xl md:text-3xl font-bold mb-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {config.title}
          </h1>
          <div className={`text-sm md:text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          
          {/* Progress bar */}
          <div className={`w-full max-w-md mx-auto mt-3 h-2 md:h-2 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <motion.div
              className="h-full bg-[#58CC02]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Display */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto py-2 md:py-0">
          
          {/* Audio Question - Show speaker icon */}
          <div className="mb-4 md:mb-12">
            <motion.div
              className={`w-56 h-56 md:w-80 md:h-80 rounded-3xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-slate-700 border border-slate-600'
                  : 'bg-white border border-gray-200'
              } ${isAudioPlaying ? 'ring-4 ring-[#58CC02] ring-opacity-60' : ''}`}
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
                  className="absolute inset-0 rounded-3xl bg-[#58CC02]"
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
                onClick={() => playAudio(currentQuestion.correctLetter.letter)}
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
                  fill={theme === 'dark' ? '#60A5FA' : '#3B82F6'}
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
                      theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
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
                      theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
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
                      theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
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

          {/* Answer Options */}
          <motion.div
            className="grid grid-cols-2 gap-4 w-full max-w-md md:max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={option.letter}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`relative aspect-square rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-200 ${
                  showFeedback && selectedAnswer?.letter === option.letter
                    ? isCorrect
                      ? 'bg-green-500 text-white ring-4 ring-green-300'
                      : 'bg-red-500 text-white ring-4 ring-red-300'
                    : showFeedback && option.letter === currentQuestion.correctLetter.letter
                      ? 'bg-green-500 text-white ring-4 ring-green-300'
                      : theme === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-800'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  borderColor: !showFeedback ? option.color + '20' : undefined
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
                    color: showFeedback ? 'inherit' : option.color
                  }}
                >
                  {option.letter}
                </span>

                {/* Name */}
                <span className="text-sm md:text-sm font-medium text-center">
                  {option.englishName}
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

                {showFeedback && selectedAnswer?.letter !== option.letter && option.letter === currentQuestion.correctLetter.letter && (
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