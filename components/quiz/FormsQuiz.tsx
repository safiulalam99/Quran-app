'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import arabicLetterForms from '../../app/data/arabic-letter-forms.json';

interface LetterForm {
  letter: string;
  name: string;
  englishName: string;
  sound: string;
  color: string;
  category: string;
  forms: {
    isolated: string;
    initial: string;
    medial: string;
    final: string;
  };
  connects: {
    before: boolean;
    after: boolean;
  };
}

interface QuizQuestion {
  correctAnswer: LetterForm;
  options: LetterForm[];
  questionType: 'form-recognition' | 'position-identification' | 'connection-rules' | 'form-matching' | 'word-building' | 'form-sequence';
  questionData?: {
    targetForm?: 'isolated' | 'initial' | 'medial' | 'final';
    position?: 'isolated' | 'initial' | 'medial' | 'final';
    connectionRule?: boolean;
    wordExample?: string;
    sequence?: string[];
  };
}

interface FormsQuizProps {
  quizId: 'forms-recognition' | 'position-quiz' | 'connection-quiz' | 'form-matching' | 'word-building' | 'form-sequence';
  onQuizComplete: (stats: QuizStats) => void;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

// Quiz configurations for different forms quizzes
const quizConfigs = {
  'forms-recognition': {
    title: 'Forms Recognition',
    description: 'Identify letters by their different forms',
    questionType: 'form-recognition' as const,
    totalQuestions: 10
  },
  'position-quiz': {
    title: 'Position Quiz',
    description: 'Identify letter positions in words',
    questionType: 'position-identification' as const,
    totalQuestions: 10
  },
  'connection-quiz': {
    title: 'Connection Rules',
    description: 'Learn which letters connect',
    questionType: 'connection-rules' as const,
    totalQuestions: 8
  },
  'form-matching': {
    title: 'Form Matching',
    description: 'Match forms to their positions',
    questionType: 'form-matching' as const,
    totalQuestions: 12
  },
  'word-building': {
    title: 'Word Building',
    description: 'Build words using correct letter forms',
    questionType: 'word-building' as const,
    totalQuestions: 8
  },
  'form-sequence': {
    title: 'Form Sequence',
    description: 'Identify letter forms in sequence',
    questionType: 'form-sequence' as const,
    totalQuestions: 10
  }
};

export default function FormsQuiz({ quizId, onQuizComplete }: FormsQuizProps) {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const wrongAudioRef = useRef<HTMLAudioElement>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<LetterForm | null>(null);
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
  const letters = arabicLetterForms.letterForms as LetterForm[];

  // Generate quiz questions based on quiz type
  useEffect(() => {
    const generateQuestions = () => {
      const newQuestions: QuizQuestion[] = [];
      
      for (let i = 0; i < config.totalQuestions; i++) {
        let question: QuizQuestion;
        
        switch (config.questionType) {
          case 'form-recognition':
            question = generateFormRecognitionQuestion();
            break;
          case 'position-identification':
            question = generatePositionQuestion();
            break;
          case 'connection-rules':
            question = generateConnectionQuestion();
            break;
          case 'form-matching':
            question = generateFormMatchingQuestion();
            break;
          case 'word-building':
            question = generateWordBuildingQuestion();
            break;
          case 'form-sequence':
            question = generateFormSequenceQuestion();
            break;
          default:
            question = generateFormRecognitionQuestion();
        }
        
        newQuestions.push(question);
      }
      
      // Shuffle questions
      setQuestions(newQuestions.sort(() => Math.random() - 0.5));
      setStats(prev => ({ ...prev, totalQuestions: newQuestions.length }));
    };

    generateQuestions();
  }, [quizId]);

  // Generate form recognition question
  const generateFormRecognitionQuestion = (): QuizQuestion => {
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const forms = ['isolated', 'initial', 'medial', 'final'] as const;
    const targetForm = forms[Math.floor(Math.random() * forms.length)];
    
    const wrongAnswers = letters
      .filter(l => l.letter !== correctLetter.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctLetter, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    return {
      correctAnswer: correctLetter,
      options,
      questionType: 'form-recognition',
      questionData: { targetForm }
    };
  };

  // Generate position identification question
  const generatePositionQuestion = (): QuizQuestion => {
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const positions = ['isolated', 'initial', 'medial', 'final'] as const;
    const targetPosition = positions[Math.floor(Math.random() * positions.length)];
    
    const wrongAnswers = letters
      .filter(l => l.letter !== correctLetter.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctLetter, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    return {
      correctAnswer: correctLetter,
      options,
      questionType: 'position-identification',
      questionData: { position: targetPosition }
    };
  };

  // Generate connection rules question
  const generateConnectionQuestion = (): QuizQuestion => {
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const connectionRule = Math.random() > 0.5; // Randomly choose before/after
    
    const wrongAnswers = letters
      .filter(l => l.letter !== correctLetter.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctLetter, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    return {
      correctAnswer: correctLetter,
      options,
      questionType: 'connection-rules',
      questionData: { connectionRule }
    };
  };

  // Generate form matching question
  const generateFormMatchingQuestion = (): QuizQuestion => {
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const forms = ['isolated', 'initial', 'medial', 'final'] as const;
    const targetForm = forms[Math.floor(Math.random() * forms.length)];
    
    const wrongAnswers = letters
      .filter(l => l.letter !== correctLetter.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctLetter, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    return {
      correctAnswer: correctLetter,
      options,
      questionType: 'form-matching',
      questionData: { targetForm }
    };
  };

  // Generate word building question
  const generateWordBuildingQuestion = (): QuizQuestion => {
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const forms = ['isolated', 'initial', 'medial', 'final'] as const;
    const targetForm = forms[Math.floor(Math.random() * forms.length)];
    
    // Create a simple word example
    const wordExamples = {
      'initial': 'كتاب',
      'medial': 'مدرسة', 
      'final': 'بيت',
      'isolated': 'ا'
    };
    
    const wrongAnswers = letters
      .filter(l => l.letter !== correctLetter.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctLetter, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    return {
      correctAnswer: correctLetter,
      options,
      questionType: 'word-building',
      questionData: { targetForm, wordExample: wordExamples[targetForm] }
    };
  };

  // Generate form sequence question
  const generateFormSequenceQuestion = (): QuizQuestion => {
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const forms = ['isolated', 'initial', 'medial', 'final'] as const;
    const targetForm = forms[Math.floor(Math.random() * forms.length)];
    
    const wrongAnswers = letters
      .filter(l => l.letter !== correctLetter.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctLetter, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    return {
      correctAnswer: correctLetter,
      options,
      questionType: 'form-sequence',
      questionData: { targetForm, sequence: [correctLetter.forms.isolated, correctLetter.forms.initial, correctLetter.forms.medial, correctLetter.forms.final] }
    };
  };

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

  const handleAnswerSelect = (selectedLetter: LetterForm) => {
    if (showFeedback) return;

    setSelectedAnswer(selectedLetter);
    const correct = selectedLetter.letter === currentQuestion.correctAnswer.letter;
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

    // Auto advance after 2.5 seconds
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
    }, 2500);
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.questionType) {
      case 'form-recognition':
        return (
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Which letter is this?
            </h3>
            <div className={`text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`} style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
              {currentQuestion.questionData?.targetForm && 
                currentQuestion.correctAnswer.forms[currentQuestion.questionData.targetForm as keyof typeof currentQuestion.correctAnswer.forms]
              }
            </div>
          </div>
        );

      case 'position-identification':
        return (
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Which letter is in the {currentQuestion.questionData?.position} position?
            </h3>
            <div className={`text-4xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`} style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
              {currentQuestion.questionData?.position && 
                currentQuestion.correctAnswer.forms[currentQuestion.questionData.position as keyof typeof currentQuestion.correctAnswer.forms]
              }
            </div>
          </div>
        );

      case 'connection-rules':
        return (
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Which letter {currentQuestion.questionData?.connectionRule ? 'connects' : 'does not connect'} 
              {currentQuestion.questionData?.connectionRule ? ' after' : ' after'}?
            </h3>
            <div className={`text-4xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`} style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
              {currentQuestion.correctAnswer.letter}
            </div>
          </div>
        );

      case 'form-matching':
        return (
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Match this {currentQuestion.questionData?.targetForm} form to the correct letter
            </h3>
            <div className={`text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`} style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
              {currentQuestion.questionData?.targetForm && 
                currentQuestion.correctAnswer.forms[currentQuestion.questionData.targetForm as keyof typeof currentQuestion.correctAnswer.forms]
              }
            </div>
          </div>
        );

      case 'word-building':
        return (
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Which letter completes this word?
            </h3>
            <div className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`} style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
              {currentQuestion.questionData?.wordExample}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Position: {currentQuestion.questionData?.targetForm}
            </div>
          </div>
        );

      case 'form-sequence':
        return (
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Which letter has these forms?
            </h3>
            <div className="flex justify-center space-x-4 mb-6">
              {currentQuestion.questionData?.sequence?.map((form, index) => (
                <div key={index} className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`} style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                  {form}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
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
          
          {/* Question Content */}
          <div className="mb-8 md:mb-12">
            <motion.div
              className={`w-80 h-80 md:w-96 md:h-96 rounded-3xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-slate-700 border border-slate-600'
                  : 'bg-white border border-gray-200'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {renderQuestionContent()}
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
                    : showFeedback && option.letter === currentQuestion.correctAnswer.letter
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

                {showFeedback && selectedAnswer?.letter !== option.letter && option.letter === currentQuestion.correctAnswer.letter && (
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
