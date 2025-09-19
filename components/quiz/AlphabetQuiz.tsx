'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import Navigation from '../ui/Navigation';
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
  questionType: 'audio' | 'visual';
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
          questionType: Math.random() > 0.5 ? 'audio' : 'visual'
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
        await audioRef.current.play();
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    }
  };

  const handleAnswerSelect = (selectedLetter: Letter) => {
    if (showFeedback) return;
    
    setSelectedAnswer(selectedLetter);
    const correct = selectedLetter.letter === currentQuestion.correctLetter.letter;
    setIsCorrect(correct);
    setShowFeedback(true);

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
      <div className={`min-h-screen flex flex-col p-4 pb-24 md:pb-4 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        
        {/* Audio element */}
        <audio ref={audioRef} preload="metadata" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {config.title}
          </h1>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          
          {/* Progress bar */}
          <div className={`w-full max-w-md mx-auto mt-4 h-2 rounded-full overflow-hidden ${
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
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto">
          
          {/* Question Letter/Audio */}
          <div className="mb-12">
            {currentQuestion.questionType === 'visual' ? (
              /* Visual Question - Show letter */
              <motion.div
                className={`w-60 h-60 md:w-80 md:h-80 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border border-slate-600' 
                    : 'bg-white border border-gray-200'
                }`}
                style={{
                  boxShadow: theme === 'dark' 
                    ? `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px ${currentQuestion.correctLetter.color}20`
                    : `0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px ${currentQuestion.correctLetter.color}30`
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Background glow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{ 
                    background: `radial-gradient(circle at center, ${currentQuestion.correctLetter.color}40 0%, transparent 70%)`
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Letter */}
                <motion.span
                  className="text-6xl md:text-8xl font-bold select-none leading-none relative z-10"
                  style={{ 
                    color: currentQuestion.correctLetter.color,
                    fontFamily: 'Noto Sans Arabic, sans-serif',
                    textShadow: theme === 'dark' 
                      ? `0 0 20px ${currentQuestion.correctLetter.color}60, 0 0 40px ${currentQuestion.correctLetter.color}30` 
                      : `0 0 10px ${currentQuestion.correctLetter.color}40`,
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {currentQuestion.correctLetter.letter}
                </motion.span>

                {/* Question prompt */}
                <motion.div
                  className={`absolute bottom-6 left-0 right-0 text-center ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="text-sm font-medium">What is this letter called?</div>
                </motion.div>
              </motion.div>
            ) : (
              /* Audio Question - Show speaker */
              <motion.div
                className={`w-60 h-60 md:w-80 md:h-80 rounded-3xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border border-slate-600' 
                    : 'bg-white border border-gray-200'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Play button */}
                <motion.button
                  onClick={() => playAudio(currentQuestion.correctLetter.letter)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 ${
                    theme === 'dark' 
                      ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </motion.button>

                <div className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="text-lg font-medium mb-1">Listen and choose</div>
                  <div className="text-sm opacity-75">Tap to play sound</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Answer Options */}
          <motion.div
            className="grid grid-cols-2 gap-4 w-full max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={option.letter}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`relative aspect-square rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 transition-all duration-200 ${
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
                <span className="text-xs md:text-sm font-medium text-center">
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
      
      {/* Global Bottom Navigation */}
      <Navigation currentMode="quiz" onModeChange={() => {}} />
    </>
  );
}